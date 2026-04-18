export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Users,
  MessageSquare,
  FileText,
  Database,
  Activity,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { checkOllamaHealth } from "@/lib/generation";
import { checkRerankerHealth } from "@/lib/reranker";

export default async function AdminDashboardPage() {
  const [users, sessions, documents, chunks, ollamaStatus, rerankerStatus] =
    await Promise.all([
      prisma.user.count(),
      prisma.chatSession.count(),
      prisma.document.count(),
      prisma.documentChunk.count(),
      checkOllamaHealth(),
      checkRerankerHealth(),
    ]);

  const statCards = [
    {
      label: "Total Users",
      value: users,
      icon: Users,
      iconBg: "bg-blue-500/20 backdrop-blur-md border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
      iconColor: "text-blue-600 dark:text-blue-400 font-bold",
    },
    {
      label: "Chat Sessions",
      value: sessions,
      icon: MessageSquare,
      iconBg: "bg-orange-500/20 backdrop-blur-md border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]",
      iconColor: "text-orange-600 dark:text-orange-400 font-bold",
    },
    {
      label: "Documents",
      value: documents,
      icon: FileText,
      iconBg: "bg-green-500/20 backdrop-blur-md border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
      iconColor: "text-green-600 dark:text-green-400 font-bold",
    },
    {
      label: "Total Chunks",
      value: chunks,
      icon: Database,
      iconBg: "bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
      iconColor: "text-purple-600 dark:text-purple-400 font-bold",
    },
  ];

  const healthCards = [
    {
      label: "Ollama",
      connected: ollamaStatus,
    },
    {
      label: "Reranker",
      connected: rerankerStatus,
    },
    {
      label: "Database",
      connected: true,
    },
  ];

  const quickActions = [
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Upload Documents", href: "/admin/documents", icon: FileText },
    { label: "Configure Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">Overview of your application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="glass-card rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-4xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${iconBg}`}>
                <Icon className={`size-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Health */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="size-5 text-primary" />
          <h2
            className="text-lg font-bold text-slate-800 dark:text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Service Health
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {healthCards.map(({ label, connected }) => (
            <div
              key={label}
              className="glass-card rounded-xl flex items-center gap-3 p-4 transition-all duration-300 hover:bg-white/30 dark:hover:bg-black/30"
            >
              <span
                className={`h-3 w-3 rounded-full shrink-0 shadow-sm ${
                  connected
                    ? "bg-green-500 animate-pulse shadow-green-500/50"
                    : "bg-red-500 shadow-red-500/50"
                }`}
              />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                <p className={`text-xs font-semibold ${connected ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {connected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="size-5 text-primary" />
          <h2
            className="text-lg font-bold text-slate-800 dark:text-slate-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Quick Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl glass-card px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
