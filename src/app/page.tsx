import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Brain, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section
        className="flex flex-1 flex-col items-center justify-center px-4 py-28 text-center"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, #eff6ff 0%, #f8fafc 70%)",
        }}
      >
        <h1 className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl"
            style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}>
          Welcome to{" "}
          <span
            className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
          >
            SPMVV EDUBOT
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-500">
          Your AI-powered college assistant — get instant answers about
          academics, facilities, faculty, and more at Sri Padmavati Mahila
          Visvavidyalayam.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-blue-600 px-8 py-3 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2
          className="text-center text-3xl font-bold text-slate-800"
          style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
        >
          What makes EDUBOT special
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3
              className="text-lg font-bold text-slate-800"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              Instant College Info
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Ask any question about departments, courses, timetables, or campus
              resources and get accurate answers in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3
              className="text-lg font-bold text-slate-800"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              Smart AI Retrieval
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Powered by RAG — semantic search over college documents combined
              with local Mistral LLM for precise, grounded responses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3
              className="text-lg font-bold text-slate-800"
              style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
            >
              Faculty &amp; Student Access
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Role-based access ensures students and faculty each see the
              information relevant to them, securely and privately.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2
            className="text-center text-3xl font-bold text-slate-800"
            style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
          >
            How It Works
          </h2>
          <div className="relative mt-12 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
            {/* Dashed connector (desktop only) */}
            <div
              className="absolute top-6 hidden h-px w-2/3 border-t-2 border-dashed border-blue-200 sm:block"
              aria-hidden="true"
            />

            {[
              { step: "1", label: "Ask a Question", desc: "Type any query about college academics, events, or resources." },
              { step: "2", label: "AI Searches Documents", desc: "The system retrieves the most relevant content from college PDFs." },
              { step: "3", label: "Get Accurate Answers", desc: "Mistral generates a grounded answer with the retrieved context." },
            ].map(({ step, label, desc }) => (
              <div key={step} className="relative z-10 flex max-w-xs flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm">
                  {step}
                </div>
                <h3
                  className="mt-4 text-base font-bold text-slate-800"
                  style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
                >
                  {label}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto flex flex-col items-center px-4 text-center">
          <h2
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading, Poppins, sans-serif)" }}
          >
            Ready to get started?
          </h2>
          <p className="mt-3 max-w-xl text-blue-100">
            Join SPMVV EDUBOT and get instant AI-powered answers about your
            college — anytime, offline.
          </p>
          <Link
            href="/register"
            className="mt-8 rounded-lg border-2 border-white px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-blue-600"
          >
            Create Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
