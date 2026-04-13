const RERANKER_URL = process.env.RERANKER_URL || "http://localhost:8000";

export interface RerankResult {
  index: number;
  text: string;
  score: number;
}

export async function rerank(
  query: string,
  documents: string[],
  topN = 5
): Promise<RerankResult[]> {
  try {
    const response = await fetch(`${RERANKER_URL}/rerank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, documents, top_n: topN }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Reranker responded with ${response.status}`);
    }

    const data = await response.json();
    return data.results as RerankResult[];
  } catch (err) {
    console.warn("Reranker unavailable, using fallback:", err);
    return documents.slice(0, topN).map((text, index) => ({ index, text, score: 0 }));
  }
}

export async function checkRerankerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${RERANKER_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
