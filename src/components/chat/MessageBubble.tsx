import ReactMarkdown from "react-markdown";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div
        className="flex flex-col items-end gap-1"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <span className="text-xs text-slate-400 text-right mb-1">You</span>
        <div className="max-w-[70%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-start gap-1"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <span className="flex items-center gap-1 text-xs text-blue-600 mb-1">
        <Bot className="size-3" />
        EDUBOT
      </span>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm text-slate-800",
          "prose prose-sm prose-slate max-w-none",
          "prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
          "prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
