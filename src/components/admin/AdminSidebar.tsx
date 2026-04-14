"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/roles", label: "Roles", icon: Shield, exact: false },
  { href: "/admin/documents", label: "Documents", icon: FileText, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      {/* Top branding */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight" style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)" }}>
              Admin Panel
            </p>
            <p className="text-xs text-slate-500 leading-tight">Manage your application</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 pl-[10px]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-slate-200">
        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <ArrowLeft className="size-5 shrink-0" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
