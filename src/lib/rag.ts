import { prisma } from "./db";
import { getEmbedding } from "./embeddings";
import { generate, generateStream } from "./generation";
import { rerank } from "./reranker";
import { bm25Search } from "./bm25";
import { getSetting } from "./settings";

export interface RagResponse {
  type: "text" | "pdf";
  data: string;
  subject?: string;
}

export interface StreamChunk {
  type: "token" | "text" | "pdf";
  data: string;
  subject?: string;
}

interface ChunkRow {
  id: string;
  content: string;
  document_id: string;
  distance?: number;
}

// Search for a subject PDF by keyword triggers, code, subject name, or semantic fallback
export async function searchSubjectPdf(query: string): Promise<RagResponse | null> {
  const keywords = await getSetting<string[]>("pdf_search_keywords");
  if (!Array.isArray(keywords) || keywords.length === 0) return null;

  const lower = query.toLowerCase();
  const triggered = keywords.some((kw) => lower.includes(kw.toLowerCase()));
  if (!triggered) return null;

  // Try exact code match
  const byCode = await prisma.document.findFirst({
    where: {
      category: "subject_pdf",
      code: { equals: query.trim(), mode: "insensitive" },
    },
    select: { id: true, subject: true },
  });
  if (byCode) {
    return { type: "pdf", data: `/api/documents/download/${byCode.id}`, subject: byCode.subject ?? undefined };
  }

  // Try exact subject match
  const bySubject = await prisma.document.findFirst({
    where: {
      category: "subject_pdf",
      subject: { equals: query.trim(), mode: "insensitive" },
    },
    select: { id: true, subject: true },
  });
  if (bySubject) {
    return { type: "pdf", data: `/api/documents/download/${bySubject.id}`, subject: bySubject.subject ?? undefined };
  }

  // Semantic fallback via pgvector
  try {
    const embedding = await getEmbedding(query);
    const vector = `[${embedding.join(",")}]`;

    const rows = await prisma.$queryRawUnsafe<{ id: string; subject: string | null; distance: number }[]>(
      `SELECT d.id, d.subject, dc.embedding <=> $1::vector AS distance
       FROM document_chunks dc
       JOIN documents d ON dc.document_id = d.id
       WHERE d.category = 'subject_pdf'
       ORDER BY dc.embedding <=> $1::vector
       LIMIT 1`,
      vector
    );

    if (rows.length > 0 && rows[0].distance <= 1.2) {
      const row = rows[0];
      return { type: "pdf", data: `/api/documents/download/${row.id}`, subject: row.subject ?? undefined };
    }
  } catch (err) {
    console.warn("Semantic PDF search failed:", err);
  }

  return null;
}

// Retrieve knowledge-base chunks via pgvector + BM25 hybrid
export async function retrieve(
  query: string,
  hasRestrictedAccess: boolean,
  topK: number
): Promise<ChunkRow[]> {
  const embedding = await getEmbedding(query);
  const vector = `[${embedding.join(",")}]`;

  const restrictionClause = hasRestrictedAccess ? "" : "AND d.is_restricted = false";

  const vectorRows = await prisma.$queryRawUnsafe<ChunkRow[]>(
    `SELECT dc.id, dc.content, dc.document_id, dc.embedding <=> $1::vector AS distance
     FROM document_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE d.category = 'knowledge_base'
     ${restrictionClause}
     ORDER BY dc.embedding <=> $1::vector
     LIMIT $2`,
    vector,
    topK * 2
  );

  // Fetch all qualifying chunks for BM25
  const allChunks = await prisma.$queryRawUnsafe<ChunkRow[]>(
    `SELECT dc.id, dc.content, dc.document_id
     FROM document_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE d.category = 'knowledge_base'
     ${restrictionClause}`
  );

  const bm25Results = bm25Search(
    query,
    allChunks.map((c: ChunkRow) => ({ id: c.id, content: c.content })),
    topK * 2
  );

  // Merge and deduplicate by id
  const seen = new Set<string>();
  const merged: ChunkRow[] = [];

  for (const row of vectorRows) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      merged.push(row);
    }
  }
  for (const row of bm25Results) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      merged.push({ id: row.id, content: row.content, document_id: "" });
    }
  }

  return merged.slice(0, topK * 2);
}

function buildPrompt(systemPrompt: string, context: string, question: string): string {
  return systemPrompt
    .replace("{context}", context)
    .replace("{question}", question);
}

// Non-streaming RAG answer
export async function ask(query: string, permissions: string[]): Promise<RagResponse> {
  // 1. Check for subject PDF
  const pdfResult = await searchSubjectPdf(query);
  if (pdfResult) return pdfResult;

  // 2. Retrieve candidates
  const hasRestrictedAccess = permissions.includes("pdf:restricted");
  const topK = (await getSetting<number>("top_k")) ?? 5;

  let candidates: ChunkRow[];
  try {
    candidates = await retrieve(query, hasRestrictedAccess, topK);
  } catch (err) {
    console.warn("Retrieval failed:", err);
    candidates = [];
  }

  if (candidates.length === 0) {
    const fallback = await getSetting<string>("no_results_message");
    return { type: "text", data: fallback ?? "I could not find relevant information to answer your question." };
  }

  // 3. Rerank
  const texts = candidates.map((c) => c.content);
  const reranked = await rerank(query, texts, topK);
  const context = reranked.map((r) => r.text).join("\n\n");

  // 4. Build prompt
  const systemPrompt = (await getSetting<string>("system_prompt")) ?? "{context}\n\nQuestion: {question}";
  const prompt = buildPrompt(systemPrompt, context, query);

  // 5. Generate
  try {
    const answer = await generate(prompt);
    return { type: "text", data: answer };
  } catch (err) {
    console.warn("Generation failed:", err);
    return { type: "text", data: "Sorry, I encountered an error generating a response." };
  }
}

// Streaming RAG answer
export async function* askStream(
  query: string,
  permissions: string[]
): AsyncGenerator<StreamChunk> {
  // 1. Check for subject PDF
  const pdfResult = await searchSubjectPdf(query);
  if (pdfResult) {
    yield { type: "pdf", data: pdfResult.data, subject: pdfResult.subject };
    return;
  }

  // 2. Retrieve candidates
  const hasRestrictedAccess = permissions.includes("pdf:restricted");
  const topK = (await getSetting<number>("top_k")) ?? 5;

  let candidates: ChunkRow[];
  try {
    candidates = await retrieve(query, hasRestrictedAccess, topK);
  } catch (err) {
    console.warn("Retrieval failed:", err);
    candidates = [];
  }

  if (candidates.length === 0) {
    const fallback = await getSetting<string>("no_results_message");
    yield { type: "text", data: fallback ?? "I could not find relevant information to answer your question." };
    return;
  }

  // 3. Rerank
  const texts = candidates.map((c) => c.content);
  const reranked = await rerank(query, texts, topK);
  const context = reranked.map((r) => r.text).join("\n\n");

  // 4. Build prompt
  const systemPrompt = (await getSetting<string>("system_prompt")) ?? "{context}\n\nQuestion: {question}";
  const prompt = buildPrompt(systemPrompt, context, query);

  // 5. Stream generation
  try {
    for await (const token of generateStream(prompt)) {
      yield { type: "token", data: token };
    }
  } catch (err) {
    console.warn("Streaming generation failed:", err);
    yield { type: "text", data: "Sorry, I encountered an error generating a response." };
  }
}
