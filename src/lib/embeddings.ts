import { getSetting } from "./settings";

export async function getEmbedding(text: string): Promise<number[]> {
  const ollamaUrl = await getSetting<string>("ollama_url");
  const model = await getSetting<string>("embedding_model");
  const truncated = text.slice(0, 1500);

  const response = await fetch(`${ollamaUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: truncated }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const embedding = await getEmbedding(text);
    results.push(embedding);
  }
  return results;
}
