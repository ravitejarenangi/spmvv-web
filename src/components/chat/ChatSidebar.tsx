"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ChatSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchSessions();
  }, [pathname]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (pathname === `/chat/${id}`) {
          router.push("/chat");
        }
      }
    } catch {
      // ignore
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-200">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="size-4" />
          New Chat
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length > 0 && (
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your conversations
          </p>
        )}
        {sessions.length === 0 ? (
          <p className="px-4 py-3 text-xs text-slate-400">No conversations yet</p>
        ) : (
          sessions.map((session) => {
            const isActive = pathname === `/chat/${session.id}`;
            return (
              <Link
                key={session.id}
                href={`/chat/${session.id}`}
                className={cn(
                  "group flex items-start gap-2 px-3 py-2 mx-1 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                <MessageSquare className="size-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium leading-5">
                    {session.title ?? "New Chat"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="flex-shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="size-3" />
                </button>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
