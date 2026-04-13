"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  faculty: "bg-blue-100 text-blue-700 border-blue-200",
  student: "bg-green-100 text-green-700 border-green-200",
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
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight transition-opacity hover:opacity-80"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <GraduationCap className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span>SPMVV EDUBOT</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-primary bg-blue-50"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
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
                <Button variant="ghost" size="sm" className="transition-colors duration-200">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="transition-colors duration-200">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors duration-200"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-primary bg-blue-50"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
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
