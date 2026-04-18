"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-gradient-to-tr from-purple-500/20 to-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-500/30 backdrop-blur-sm",
  faculty: "bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 backdrop-blur-sm",
  student: "bg-gradient-to-tr from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-green-500/30 backdrop-blur-sm",
};

function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  const styles = roleBadgeStyles[role.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", styles)}>
      {label}
    </span>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const permissions: string[] = session?.user?.permissions ?? [];
  const role: string = session?.user?.role ?? "";

  const navLinks = [
    { href: "/", label: "Home", always: true },
    { href: "/about", label: "About", always: true },
    { href: "/chat", label: "Chat", requiresAuth: true },
    { href: "/admin", label: "Admin", requiresPermission: "admin:dashboard" },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (link.always) return true;
    if (link.requiresAuth && session) return true;
    if (link.requiresPermission && session && permissions.includes(link.requiresPermission)) return true;
    return false;
  });

  return (
    <nav className="sticky top-0 z-50 glass-panel rounded-none border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold text-lg tracking-tight transition-all duration-300 hover:scale-[1.02]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <GraduationCap className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <span>SPMVV EDUBOT</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                pathname === link.href
                  ? "text-primary bg-white/30 dark:bg-black/30 shadow-sm shadow-primary/10 border border-white/20"
                  : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-white/20 dark:hover:bg-black/20"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <span className="text-sm text-slate-600 font-medium">{session.user?.name}</span>
              {role && <RoleBadge role={role} />}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-black/20 rounded-xl transition-colors duration-300">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="glass-button rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle & Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors duration-200"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                pathname === link.href
                  ? "text-primary bg-white/40 dark:bg-black/40 border border-white/20"
                  : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-white/20 dark:hover:bg-black/20"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {session ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1">
                  <span className="text-sm text-slate-600 font-medium">{session.user?.name}</span>
                  {role && <RoleBadge role={role} />}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full transition-colors duration-200">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full transition-colors duration-200">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
