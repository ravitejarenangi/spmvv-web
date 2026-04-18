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
        <div className="max-w-[70%] rounded-2xl rounded-br-md bg-gradient-to-tr from-primary to-accent px-4 py-3 text-sm text-white shadow-md backdrop-blur-sm shadow-primary/20 border border-white/20">
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
      <span className="flex items-center gap-1 text-xs text-primary font-semibold mb-1">
        <Bot className="size-3" />
        EDUBOT
      </span>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl rounded-bl-md glass-panel px-4 py-3 text-slate-800 dark:text-slate-200",
          "prose prose-sm prose-slate dark:prose-invert max-w-none",
          "prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
          "prose-code:bg-white/50 dark:prose-code:bg-black/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm border border-white/30 dark:border-white/10"
        )}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
