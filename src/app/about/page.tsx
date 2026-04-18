"use client";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThreeBackground } from "@/components/ui/ThreeBackground";
import {
  Search,
  FileText,
  Shield,
  Brain,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function AboutPage() {
  useEffect(() => {
    import("animejs").then((module) => {
      const anime = (module as any).default || module;
      anime({
        targets: '.about-animate',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
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

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="py-28 pt-32 text-center">
          <div className="container mx-auto max-w-4xl px-4">
            <h1
              className="about-animate text-5xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-6xl drop-shadow-md"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              About{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent filter drop-shadow-lg">
                SPMVV EDUBOT
              </span>
            </h1>
            <p className="about-animate mx-auto mt-6 max-w-2xl text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              An offline AI-powered assistant built to help students and faculty
              at Sri Padmavati Mahila Visvavidyalayam find information
              instantly — no internet required.
            </p>
          </div>
        </section>

        {/* What is this project */}
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="about-animate glass-panel rounded-2xl border-l-[6px] border-l-primary p-10 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 pointer-events-none" />
              <h2
                className="text-3xl font-bold text-slate-800 dark:text-slate-100 relative z-10"
                style={{
                  fontFamily: "var(--font-heading, Poppins, sans-serif)",
                }}
              >
                What is this project?
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-700 dark:text-slate-300 font-medium relative z-10">
                SPMVV EDUBOT is an offline AI-powered assistant built for Sri
                Padmavati Mahila Visvavidyalayam. It helps students and faculty
                quickly find information about college departments, courses,
                timetables, events, and administrative resources — without
                needing an internet connection.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 font-medium relative z-10">
                The system leverages Retrieval Augmented Generation (RAG) to
                search over college documents and generate accurate,
                context-grounded answers using a locally running Mistral LLM
                via Ollama.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-y border-white/10 -z-10" />
          <div className="container mx-auto max-w-5xl px-4 z-10 relative">
            <h2
              className="about-animate text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm text-center"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              Key Features
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: Search,
                  title: "Semantic Search",
                  desc: "Semantic search over college PDFs and documents using FAISS for deep contextual understanding.",
                },
                {
                  icon: BookOpen,
                  title: "BM25 Keyword Retrieval",
                  desc: "Exact-match keyword retrieval with BM25 to handle precise terminology queries.",
                },
                {
                  icon: Brain,
                  title: "CrossEncoder Reranking",
                  desc: "High-precision reranking of retrieved results using a CrossEncoder model.",
                },
                {
                  icon: GraduationCap,
                  title: "Fully Offline LLM",
                  desc: "Local LLM generation via Mistral through Ollama — works entirely without internet.",
                },
                {
                  icon: Shield,
                  title: "Role-Based Access",
                  desc: "Secure role-based access control so students and faculty see only what's relevant to them.",
                },
                {
                  icon: FileText,
                  title: "Direct PDF Links",
                  desc: "Instant PDF link resolution for question papers and handouts — no digging required.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="about-animate flex gap-5 glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:-translate-y-1"
                >
                  <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/20 shadow-inner">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold text-slate-800 dark:text-slate-100"
                      style={{
                        fontFamily: "var(--font-heading, Poppins, sans-serif)",
                      }}
                    >
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24">
          <div className="container mx-auto max-w-4xl px-4">
            <h2
              className="about-animate text-3xl font-bold text-slate-800 dark:text-white drop-shadow-sm text-center"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              How it Works
            </h2>
            <div className="mt-16 space-y-0 relative">
              <div className="absolute left-[1.15rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-primary/30 to-accent/30 hidden md:block" />
              {[
                {
                  step: "01",
                  title: "Query Submitted",
                  desc: "You type a question about college academics, events, or resources.",
                },
                {
                  step: "02",
                  title: "Document Matching",
                  desc: (
                    <>
                      The system checks for a matching college document by
                      keyword. If a PDF is found, a direct download link is
                      returned immediately.
                    </>
                  ),
                },
                {
                  step: "03",
                  title: "Embedding & Retrieval",
                  desc: (
                    <>
                      Otherwise, the query is embedded using{" "}
                      <span className="font-bold text-primary">
                        nomic-embed-text
                      </span>{" "}
                      and the most relevant chunks are retrieved from the FAISS
                      vector store.
                    </>
                  ),
                },
                {
                  step: "04",
                  title: "Fusion & Reranking",
                  desc: "BM25 scores are fused with semantic scores, and the top candidates are re-ranked with a CrossEncoder for high precision.",
                },
                {
                  step: "05",
                  title: "Answer Generation",
                  desc: (
                    <>
                      The final context is passed to{" "}
                      <span className="font-bold text-primary">
                        Mistral
                      </span>{" "}
                      running locally via Ollama to generate a grounded,
                      accurate answer.
                    </>
                  ),
                },
              ].map(({ step, title, desc }, i, arr) => (
                <div key={step} className="about-animate flex flex-col md:flex-row gap-6 relative z-10">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                      {step}
                    </div>
                  </div>
                  {/* Content */}
                  <div className={i < arr.length - 1 ? "pb-12 pt-2" : "pb-0 pt-2"}>
                    <h3
                      className="text-xl font-bold text-slate-800 dark:text-slate-100"
                      style={{
                        fontFamily: "var(--font-heading, Poppins, sans-serif)",
                      }}
                    >
                      {title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
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
