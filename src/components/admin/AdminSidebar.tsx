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
import { useEffect } from "react";
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

  useEffect(() => {
    import("animejs").then((module) => {
      const anime = (module as any).default || module;
      anime({
        targets: '.admin-sidebar-item',
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutQuad'
      });
    });
  }, [pathname]);

  return (
    <aside className="w-64 shrink-0 border-r border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-md flex flex-col">
      {/* Top branding */}
      <div className="px-6 py-5 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent shadow-md border border-white/20">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Panel
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight tracking-wide">Manage application</p>
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
                "admin-sidebar-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 font-semibold backdrop-blur-sm border",
                isActive
                  ? "bg-white/40 dark:bg-black/40 text-primary border-primary/50 shadow-[0_4px_15px_rgba(var(--primary),0.15)] shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/30 border-transparent hover:border-white/20"
              )}
            >
              <Icon className={cn("size-5 shrink-0 transition-colors duration-300", isActive ? "text-primary" : "text-slate-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/20">
        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/20 border border-transparent transition-all duration-300"
        >
          <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-1" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
