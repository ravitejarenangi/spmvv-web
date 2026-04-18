"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThreeBackground } from "@/components/ui/ThreeBackground";
import { BookOpen, Brain, Users } from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    import("animejs").then((module) => {
      const anime = (module as any).default || module;
      anime({
        targets: '.home-animate-up',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 800,
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.home-card',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(200, { start: 400 }),
        duration: 800,
        easing: 'easeOutExpo'
      });
    });
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10 block">
        <Navbar />
      </div>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-4 py-28 text-center pt-32">
          <h1 className="home-animate-up text-5xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-6xl drop-shadow-md"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}>
            Welcome to{" "}
            <span
              className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent filter drop-shadow-lg"
            >
              SPMVV EDUBOT
            </span>
          </h1>
          <p className="home-animate-up mt-5 max-w-2xl text-lg text-slate-700 dark:text-slate-300 font-medium">
            Your AI-powered college assistant — get instant answers about
            academics, facilities, faculty, and more at Sri Padmavati Mahila
            Visvavidyalayam.
          </p>
          <div className="home-animate-up mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="glass-button rounded-xl px-10 py-4 text-base font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-primary/50 bg-white/10 dark:bg-black/10 backdrop-blur-md px-10 py-4 text-base font-bold text-slate-800 dark:text-slate-200 transition-all hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 relative">
          <h2
            className="home-animate-up text-center text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm"
            style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
          >
            What makes EDUBOT special
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="home-card glass-card rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(var(--primary),0.2)] transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/20 shadow-inner">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3
                className="text-xl font-bold text-slate-800 dark:text-slate-100"
                style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
              >
                Instant College Info
              </h3>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask any question about departments, courses, timetables, or campus
                resources and get accurate answers in seconds.
              </p>
            </div>

            {/* Card 2 */}
            <div className="home-card glass-card rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(var(--primary),0.2)] transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/20 shadow-inner">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h3
                className="text-xl font-bold text-slate-800 dark:text-slate-100"
                style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
              >
                Smart AI Retrieval
              </h3>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by RAG — semantic search over college documents combined
                with local Mistral LLM for precise, grounded responses.
              </p>
            </div>

            {/* Card 3 */}
            <div className="home-card glass-card rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(var(--primary),0.2)] transition-all duration-300">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/20 shadow-inner">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3
                className="text-xl font-bold text-slate-800 dark:text-slate-100"
                style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
              >
                Faculty &amp; Student Access
              </h3>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Role-based access ensures students and faculty each see the
                information relevant to them, securely and privately.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-y border-white/10 -z-10" />
          <div className="container mx-auto px-4 z-10 relative">
            <h2
              className="home-animate-up text-center text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              How It Works
            </h2>
            <div className="relative mt-16 flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center">
              {/* Dashed connector (desktop only) */}
              <div
                className="absolute top-8 hidden h-px w-2/3 border-t-2 border-dashed border-primary/40 sm:block"
                aria-hidden="true"
              />

              {[
                { step: "1", label: "Ask a Question", desc: "Type any query about college academics, events, or resources." },
                { step: "2", label: "AI Searches Documents", desc: "The system retrieves the most relevant content from college PDFs." },
                { step: "3", label: "Get Accurate Answers", desc: "Mistral generates a grounded answer with the retrieved context." },
              ].map(({ step, label, desc }) => (
                <div key={step} className="home-card relative z-10 flex max-w-xs flex-col items-center text-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] group-hover:scale-110 transition-transform duration-300">
                    {step}
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold text-slate-800 dark:text-slate-100"
                    style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
                  >
                    {label}
                  </h3>
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto flex flex-col items-center px-4 text-center relative z-10">
            <div className="glass-panel p-16 rounded-3xl w-full max-w-4xl flex flex-col items-center">
              <h2
                className="home-animate-up opacity-0 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent filter drop-shadow-md"
                style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
              >
                Ready to get started?
              </h2>
              <p className="home-animate-up opacity-0 mt-4 max-w-xl text-lg font-medium text-slate-700 dark:text-slate-300">
                Join SPMVV EDUBOT and get instant AI-powered answers about your
                college — anytime, offline.
              </p>
              <div className="home-animate-up opacity-0">
                <Link
                  href="/register"
                  className="glass-button mt-10 rounded-xl px-12 py-4 text-lg font-bold transition-all hover:scale-105 shadow-[0_0_25px_rgba(var(--primary),0.4)] block"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="relative z-10 block">
        <Footer />
      </div>
    </div>
  );
}
