"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquare, Trash2, Plus, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  faculty: "bg-blue-100 text-blue-700 border-blue-200",
  student: "bg-green-100 text-green-700 border-green-200",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ChatSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
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

  useEffect(() => {
    if (sessions.length > 0) {
      import("animejs").then((module) => {
        const anime = (module as any).default || module;
        anime({
          targets: '.sidebar-item',
          translateX: [-20, 0],
          opacity: [0, 1],
          delay: anime.stagger(50),
          duration: 500,
          easing: 'easeOutQuad'
        });
      });
    }
  }, [sessions.length]);

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

  const userName = session?.user?.name ?? null;
  const userRole: string = (session?.user as { role?: string })?.role ?? "";
  const initials = getInitials(userName);
  const roleBadgeStyle =
    roleBadgeStyles[userRole.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const roleLabel = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()
    : null;

  return (
    <aside className="w-72 flex-shrink-0 border-r border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent shadow-lg border border-white/30 backdrop-blur-md">
            <GraduationCap className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p
              className="text-sm font-semibold text-slate-800 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              SPMVV EDUBOT
            </p>
            <p className="text-xs text-slate-400 leading-tight">AI Assistant</p>
          </div>
        </div>

        {/* New Chat button */}
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl glass-button text-sm font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="size-4" />
          New Chat
        </Link>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-1 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your conversations
        </p>

        {sessions.length === 0 ? (
          <p className="px-1 py-2 text-xs text-slate-400">No conversations yet</p>
        ) : (
          <ul className="space-y-0.5">
            {sessions.map((session) => {
              const isActive = pathname === `/chat/${session.id}`;
              return (
                <li
                  key={session.id}
                  className="sidebar-item opacity-0"
                >
                  <Link
                    href={`/chat/${session.id}`}
                    className={cn(
                      "group flex items-start gap-2.5 p-3 rounded-xl text-sm transition-all duration-300 cursor-pointer backdrop-blur-sm border",
                      isActive
                        ? "bg-white/40 dark:bg-black/40 border-primary/50 shadow-md text-primary dark:text-primary-foreground"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/30 border-transparent hover:border-white/20"
                    )}
                  >
                    <MessageSquare
                      className={cn(
                        "size-4 mt-0.5 flex-shrink-0 transition-colors duration-300",
                        isActive ? "text-primary" : "text-slate-500"
                      )}
                    />
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
                      className="flex-shrink-0 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-50"
                      title="Delete conversation"
                    >
                      <Trash2 className="size-3.5 text-slate-400 hover:text-red-500 transition-colors duration-150" />
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bottom user info */}
      {session?.user && (
        <div className="px-3 py-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/20">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate leading-tight">
                {userName ?? "User"}
              </p>
              {roleLabel && (
                <span
                  className={cn(
                    "inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border leading-tight",
                    roleBadgeStyle
                  )}
                >
                  {roleLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
