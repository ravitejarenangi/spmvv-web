import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search,
  FileText,
  Shield,
  Brain,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export const metadata = {
  title: "About — SPMVV EDUBOT",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="py-20 text-center"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, #eff6ff 0%, #f8fafc 70%)",
          }}
        >
          <div className="container mx-auto max-w-4xl px-4">
            <h1
              className="text-4xl font-bold text-slate-800 sm:text-5xl"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              About{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                SPMVV EDUBOT
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
              An offline AI-powered assistant built to help students and faculty
              at Sri Padmavati Mahila Visvavidyalayam find information
              instantly — no internet required.
            </p>
          </div>
        </section>

        {/* What is this project */}
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="rounded-xl border-l-4 border-blue-600 bg-white p-8 shadow-sm">
              <h2
                className="text-2xl font-bold text-slate-800"
                style={{
                  fontFamily: "var(--font-heading, Poppins, sans-serif)",
                }}
              >
                What is this project?
              </h2>
              <p className="mt-4 leading-relaxed text-slate-500">
                SPMVV EDUBOT is an offline AI-powered assistant built for Sri
                Padmavati Mahila Visvavidyalayam. It helps students and faculty
                quickly find information about college departments, courses,
                timetables, events, and administrative resources — without
                needing an internet connection.
              </p>
              <p className="mt-3 leading-relaxed text-slate-500">
                The system leverages Retrieval Augmented Generation (RAG) to
                search over college documents and generate accurate,
                context-grounded answers using a locally running Mistral LLM
                via Ollama.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="bg-white py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <h2
              className="text-2xl font-bold text-slate-800"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              Key Features
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                  className="flex gap-4 rounded-xl bg-slate-50 p-5 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-slate-800"
                      style={{
                        fontFamily: "var(--font-heading, Poppins, sans-serif)",
                      }}
                    >
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <h2
              className="text-2xl font-bold text-slate-800"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              How it Works
            </h2>
            <div className="mt-8 space-y-0">
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
                      <span className="font-medium text-slate-700">
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
                      <span className="font-medium text-slate-700">
                        Mistral
                      </span>{" "}
                      running locally via Ollama to generate a grounded,
                      accurate answer.
                    </>
                  ),
                },
              ].map(({ step, title, desc }, i, arr) => (
                <div key={step} className="flex gap-6">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="mt-1 w-px flex-1 border-l-2 border-dashed border-blue-200" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={i < arr.length - 1 ? "pb-8" : "pb-0"}>
                    <h3
                      className="pt-1.5 font-bold text-slate-800"
                      style={{
                        fontFamily: "var(--font-heading, Poppins, sans-serif)",
                      }}
                    >
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
