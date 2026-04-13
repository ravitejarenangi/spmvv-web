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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 flex flex-col overflow-hidden">
      <div className="p-3 border-b">
        <Link
          href="/chat"
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Plus className="size-4" />
          New Chat
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 ? (
          <p className="px-4 py-3 text-xs text-muted-foreground">No conversations yet</p>
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
                    ? "bg-white shadow-sm border border-gray-200 text-foreground"
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                )}
                onMouseEnter={() => setHoveredId(session.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MessageSquare className="size-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium leading-5">
                    {session.title ?? "New Chat"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                {(isActive || hoveredId === session.id) && (
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="flex-shrink-0 rounded p-0.5 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
