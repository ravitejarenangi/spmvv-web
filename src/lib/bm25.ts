const K1 = 1.5;
const B = 0.75;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\W/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export interface BM25Document {
  id: string;
  content: string;
}

export interface BM25Result {
  id: string;
  content: string;
  score: number;
}

export function bm25Search(
  query: string,
  documents: BM25Document[],
  topK = 8
): BM25Result[] {
  if (documents.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const tokenizedDocs = documents.map((doc) => tokenize(doc.content));

  const totalLength = tokenizedDocs.reduce((sum, tokens) => sum + tokens.length, 0);
  const avgDl = totalLength / documents.length;

  // Build document frequency map
  const df = new Map<string, number>();
  for (const tokens of tokenizedDocs) {
    const unique = new Set(tokens);
    for (const token of unique) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }

  const N = documents.length;

  const scores = documents.map((doc, i) => {
    const tokens = tokenizedDocs[i];
    const dl = tokens.length;

    // Term frequency map for this doc
    const tf = new Map<string, number>();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTokens) {
      const termTf = tf.get(term) ?? 0;
      if (termTf === 0) continue;

      const termDf = df.get(term) ?? 0;
      const idf = Math.log((N - termDf + 0.5) / (termDf + 0.5) + 1);
      const tfNorm = (termTf * (K1 + 1)) / (termTf + K1 * (1 - B + B * (dl / avgDl)));
      score += idf * tfNorm;
    }

    return { id: doc.id, content: doc.content, score };
  });

  return scores
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
