import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { getEmbedding } from "@/lib/embeddings";
import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

function splitByWindows(text: string, chunkSize: number, overlap: number): string[] {
  const out: string[] = [];
  const step = Math.max(1, chunkSize - overlap);
  for (let i = 0; i < text.length; i += step) {
    const piece = text.slice(i, i + chunkSize).trim();
    if (piece.length > 50) out.push(piece);
    if (i + chunkSize >= text.length) break;
  }
  return out;
}

export function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  if (!text) return [];

  // Prefer paragraph/line boundaries; fall back to sentence boundaries.
  const atoms = text
    .split(/\n{2,}|\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const atom of atoms) {
    // Atom itself larger than chunk size: flush current, then window-split the atom.
    if (atom.length > chunkSize) {
      if (current.trim().length > 50) chunks.push(current.trim());
      current = "";
      chunks.push(...splitByWindows(atom, chunkSize, overlap));
      continue;
    }

    if ((current + " " + atom).trim().length > chunkSize && current.length > 0) {
      if (current.trim().length > 50) chunks.push(current.trim());
      current = current.length > overlap ? current.slice(-overlap) + " " + atom : atom;
    } else {
      current = current ? current + " " + atom : atom;
    }
  }

  if (current.trim().length > 50) chunks.push(current.trim());

  return chunks;
}

export async function ingestDocument(documentId: string): Promise<number> {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error(`Document not found: ${documentId}`);

  const chunkSize = await getSetting<number>("chunk_size") ?? 500;
  const chunkOverlap = await getSetting<number>("chunk_overlap") ?? 50;

  // Delete existing chunks
  await prisma.documentChunk.deleteMany({ where: { documentId } });

  // Read and parse PDF — filepath may be absolute or relative to cwd
  const resolvedPath = doc.filepath.startsWith("/")
    ? doc.filepath
    : path.join(process.cwd(), doc.filepath);
  const fileBuffer = fs.readFileSync(resolvedPath);
  const pdfData = await pdfParse(fileBuffer);

  // Clean text: preserve line breaks so the chunker has splitting signal
  const cleanedText = pdfData.text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\x20-\x7E\n]/g, "")
    .trim();

  // Chunk the text
  const chunks = chunkText(cleanedText, chunkSize, chunkOverlap);

  // Embed and insert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);
    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO document_chunks (id, document_id, content, chunk_index, embedding)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4::vector)`,
      documentId,
      chunks[i],
      i,
      vector
    );
  }

  return chunks.length;
}

export async function ingestAllDocuments(): Promise<{ total: number; chunks: number }> {
  const documents = await prisma.document.findMany({ select: { id: true } });
  let totalChunks = 0;

  for (const doc of documents) {
    const count = await ingestDocument(doc.id);
    totalChunks += count;
  }

  return { total: documents.length, chunks: totalChunks };
}
