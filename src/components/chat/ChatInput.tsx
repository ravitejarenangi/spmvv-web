"use client";
import { useRef, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    resize();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about SPMVV..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-50 max-h-[200px] leading-6 min-h-[44px] pt-2.5"
      />
      <button
        onClick={submit}
        disabled={isEmpty || disabled}
        className={cn(
          "flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl transition-colors",
          isEmpty || disabled
            ? "text-slate-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
        title="Send message"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
