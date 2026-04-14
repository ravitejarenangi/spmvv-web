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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Chat Sessions",
      value: sessions,
      icon: MessageSquare,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Documents",
      value: documents,
      icon: FileText,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Total Chunks",
      value: chunks,
      icon: Database,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
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
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your application</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
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
          <Activity className="size-5 text-slate-700" />
          <h2
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)" }}
          >
            Service Health
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {healthCards.map(({ label, connected }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 flex items-center gap-3 p-4"
            >
              <span
                className={`h-3 w-3 rounded-full shrink-0 ${
                  connected
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className={`text-xs ${connected ? "text-green-600" : "text-red-500"}`}>
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
          <LayoutDashboard className="size-5 text-slate-700" />
          <h2
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)" }}
          >
            Quick Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
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
