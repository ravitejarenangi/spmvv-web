"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("animejs").then((module) => {
      const anime = (module as any).default || module;
      anime({
        targets: '.register-container',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
      });
      
      anime({
        targets: '.register-item',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(150, {start: 300}),
        duration: 800,
        easing: 'easeOutExpo'
      });

      anime({
        targets: '.register-icon',
        rotate: [0, 360],
        duration: 2000,
        delay: 500,
        easing: 'easeOutElastic(1, .5)'
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Registration failed");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container glass-panel w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none rounded-2xl" />
      <div className="register-item mb-8 flex flex-col items-center gap-3 relative z-10">
        <div className="register-icon flex items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 p-4 shadow-lg backdrop-blur-md border border-white/20">
          <UserPlus className="size-8 text-primary" />
        </div>
        <h1 className="font-poppins text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Create Account
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Join SPMVV EDUBOT</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="register-item space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="glass-input h-12 rounded-xl"
          />
        </div>
        <div className="register-item space-y-2">
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
        <div className="register-item space-y-2">
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
        <div className="register-item space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
            Role
          </Label>
          <Select value={role} onValueChange={(value) => { if (value !== null) setRole(value); }}>
            <SelectTrigger
              id="role"
              className="glass-input h-12 rounded-xl"
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/20">
              <SelectItem value="student" className="cursor-pointer hover:bg-white/10 font-medium">Student</SelectItem>
              <SelectItem value="faculty" className="cursor-pointer hover:bg-white/10 font-medium">Faculty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="register-item pt-2">
          <Button
            type="submit"
            className="glass-button h-12 w-full rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>
        </div>
      </form>

      <p className="register-item mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-accent transition-colors duration-300 font-bold"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
