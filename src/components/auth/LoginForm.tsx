"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/chat");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>(".login-container, .login-item")
        .forEach((el) => {
          el.style.opacity = "1";
        });
    };

    import("animejs")
      .then((module) => {
        const anime = (module as any).default || module;
        if (typeof anime !== "function") {
          revealAll();
          return;
        }
        anime({
          targets: ".login-container",
          translateY: [50, 0],
          opacity: [0, 1],
          duration: 1000,
          easing: "easeOutExpo",
        });

        anime({
          targets: ".login-item",
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(150, { start: 300 }),
          duration: 800,
          easing: "easeOutExpo",
        });

        anime({
          targets: ".login-icon",
          rotate: [0, 360],
          duration: 2000,
          delay: 500,
          easing: "easeOutElastic(1, .5)",
        });
      })
      .catch(() => revealAll());
  }, []);

  return (
    <div className="login-container opacity-0 glass-panel w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none rounded-2xl" />
      <div className="login-item opacity-0 mb-8 flex flex-col items-center gap-3 relative z-10">
        <div className="login-icon flex items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 p-4 shadow-lg backdrop-blur-md border border-white/20">
          <GraduationCap className="size-8 text-primary" />
        </div>
        <h1 className="font-poppins text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Welcome Back
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="login-item opacity-0 space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass-input h-12 rounded-xl"
          />
        </div>
        <div className="login-item opacity-0 space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="glass-input h-12 rounded-xl"
          />
        </div>
        <div className="login-item opacity-0 pt-2">
          <Button
            type="submit"
            className="glass-button h-12 w-full rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      <p className="login-item opacity-0 mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-accent transition-colors duration-300 font-bold"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
