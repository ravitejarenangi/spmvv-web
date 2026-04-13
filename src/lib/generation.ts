import { getSetting } from "./settings";

export async function generate(prompt: string): Promise<string> {
  const ollamaUrl = await getSetting<string>("ollama_url");
  const model = await getSetting<string>("generation_model");

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

export async function* generateStream(prompt: string): AsyncGenerator<string> {
  const ollamaUrl = await getSetting<string>("ollama_url");
  const model = await getSetting<string>("generation_model");

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: true }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.response) {
          yield parsed.response;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      if (parsed.response) {
        yield parsed.response;
      }
    } catch {
      // skip malformed remainder
    }
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  const ollamaUrl = await getSetting<string>("ollama_url");
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
