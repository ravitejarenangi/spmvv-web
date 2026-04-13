import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { getEmbedding } from "@/lib/embeddings";
import * as fs from "fs";
import { PDFParse } from "pdf-parse";

export function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > chunkSize && current.length > 0) {
      const chunk = current.trim();
      if (chunk.length > 50) {
        chunks.push(chunk);
      }
      // Keep overlap: take last `overlap` chars of current as seed for next chunk
      current = current.length > overlap ? current.slice(-overlap) + " " + sentence : sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }

  if (current.trim().length > 50) {
    chunks.push(current.trim());
  }

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
    : require("path").join(process.cwd(), doc.filepath);
  const fileBuffer = fs.readFileSync(resolvedPath);
  const parser = new PDFParse({ data: fileBuffer });
  const textResult = await parser.getText();

  // Clean text
  const cleanedText = textResult.text
    .replace(/\s+/g, " ")
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
