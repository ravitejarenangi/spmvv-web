import { getSetting } from "./settings";

type Provider = "ollama" | "zai";

async function getProvider(): Promise<Provider> {
  const provider = await getSetting<string>("generation_provider");
  return (provider === "zai" ? "zai" : "ollama") as Provider;
}

// ── Ollama ──────────────────────────────────────────────

async function generateOllama(prompt: string): Promise<string> {
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

async function* generateStreamOllama(prompt: string): AsyncGenerator<string> {
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

// ── Z.AI (OpenAI-compatible) ────────────────────────────

async function generateZai(prompt: string): Promise<string> {
  const apiUrl = await getSetting<string>("zai_api_url");
  const apiKey = await getSetting<string>("zai_api_key");
  const model = await getSetting<string>("zai_model");

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Z.AI generation failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function* generateStreamZai(prompt: string): AsyncGenerator<string> {
  const apiUrl = await getSetting<string>("zai_api_url");
  const apiKey = await getSetting<string>("zai_api_key");
  const model = await getSetting<string>("zai_model");

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Z.AI streaming failed: ${response.status} ${text}`);
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
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;

      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

// ── Public API (routes to active provider) ──────────────

export async function generate(prompt: string): Promise<string> {
  const provider = await getProvider();
  return provider === "zai" ? generateZai(prompt) : generateOllama(prompt);
}

export async function* generateStream(prompt: string): AsyncGenerator<string> {
  const provider = await getProvider();
  if (provider === "zai") {
    yield* generateStreamZai(prompt);
  } else {
    yield* generateStreamOllama(prompt);
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

export async function checkZaiHealth(): Promise<boolean> {
  const apiUrl = await getSetting<string>("zai_api_url");
  const apiKey = await getSetting<string>("zai_api_key");
  if (!apiUrl || !apiKey) return false;
  try {
    const response = await fetch(`${apiUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
