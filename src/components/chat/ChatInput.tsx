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
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
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
    <div
      className={cn(
        "relative rounded-2xl glass-panel transition-all duration-300",
        "focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(var(--primary),0.3)] focus-within:ring-2 focus-within:ring-primary/20"
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about courses, fees, question papers..."
        rows={1}
        disabled={disabled}
        className="w-full resize-none border-none bg-transparent px-4 py-3 pr-14 text-sm outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50 min-h-[48px] max-h-[160px] leading-6 text-slate-800 dark:text-slate-100"
      />
      <button
        onClick={submit}
        disabled={isEmpty || disabled}
        className={cn(
          "absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white transition-all duration-300 hover:shadow-lg active:scale-95",
          isEmpty || disabled ? "scale-75 opacity-40 cursor-not-allowed grayscale" : "scale-100 opacity-100 shadow-[0_4px_10px_rgba(var(--primary),0.4)]"
        )}
        title="Send message"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
