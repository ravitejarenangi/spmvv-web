"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GraduationCap } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { PdfCard } from "./PdfCard";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "pdf";
  subject?: string;
}

interface ChatAreaProps {
  sessionId?: string;
  initialMessages?: Message[];
}

export function ChatArea({ sessionId: initialSessionId, initialMessages }: ChatAreaProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(initialSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSend(message: string) {
    if (loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreamingContent("");

    let streamed = false;

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: currentSessionId }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("text/event-stream")) {
        streamed = true;
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let pdfMessage: Message | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "session") {
                const sid = event.sessionId as string;
                setCurrentSessionId(sid);
                if (!currentSessionId) {
                  router.replace(`/chat/${sid}`);
                }
              } else if (event.type === "token") {
                accumulated += event.data as string;
                setStreamingContent(accumulated);
              } else if (event.type === "pdf") {
                pdfMessage = {
                  id: `pdf-${Date.now()}`,
                  role: "assistant",
                  content: event.data as string,
                  type: "pdf",
                  subject: event.subject as string,
                };
              } else if (event.type === "done") {
                setStreamingContent("");
                if (pdfMessage) {
                  setMessages((prev) => [...prev, pdfMessage!]);
                } else if (accumulated) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `assistant-${Date.now()}`,
                      role: "assistant",
                      content: accumulated,
                      type: "text",
                    },
                  ]);
                }
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      }
    } catch {
      streamed = false;
    }

    if (!streamed) {
      // Fallback to non-streaming endpoint
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, sessionId: currentSessionId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!currentSessionId && data.sessionId) {
            setCurrentSessionId(data.sessionId);
            router.replace(`/chat/${data.sessionId}`);
          }
          if (data.type === "pdf") {
            setMessages((prev) => [
              ...prev,
              {
                id: `pdf-${Date.now()}`,
                role: "assistant",
                content: data.data as string,
                type: "pdf",
                subject: data.subject as string,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: data.data as string,
                type: "text",
              },
            ]);
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            type: "text",
          },
        ]);
      }
    }

    setLoading(false);
    setStreamingContent("");
  }

  const userName = session?.user?.name ?? "there";

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex items-center justify-center rounded-full bg-slate-100 p-5">
                <GraduationCap className="size-10 text-slate-300" />
              </div>
              <h2 className="font-poppins text-xl font-semibold text-slate-700">
                Welcome, {userName}!
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Ask me anything about SPMVV. I can help with admissions, courses, faculty, schedules, and more.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.type === "pdf" && msg.subject) {
              return (
                <PdfCard
                  key={msg.id}
                  subject={msg.subject}
                  downloadUrl={msg.content}
                />
              );
            }
            return (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            );
          })}

          {/* Streaming content */}
          {streamingContent && (
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-400">EDUBOT</span>
              <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-2.5 shadow-sm prose prose-sm max-w-none prose-p:my-1">
                <p className="text-sm whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block animate-pulse text-blue-600">▊</span>
                </p>
              </div>
            </div>
          )}

          {/* Loading indicator (waiting for first token) */}
          {loading && !streamingContent && (
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-400">EDUBOT</span>
              <div className="rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 rounded-full bg-slate-300 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput onSend={handleSend} disabled={loading} />
          <p className="mt-2 text-center text-xs text-slate-400">
            AI responses may be inaccurate. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
