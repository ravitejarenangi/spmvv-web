import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About — SPMVV EDUBOT",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-16 space-y-12">
        <section>
          <h1 className="text-3xl font-bold">What is this project?</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            SPMVV EDUBOT is an offline AI-powered assistant built for Sri
            Padmavati Mahila Visvavidyalayam. It helps students and faculty
            quickly find information about college departments, courses,
            timetables, events, and administrative resources — without needing
            an internet connection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Key Features</h2>
          <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
            <li>Semantic search over college PDFs and documents using FAISS</li>
            <li>BM25 keyword retrieval for exact-match queries</li>
            <li>CrossEncoder reranking for high-precision results</li>
            <li>Local LLM generation via Mistral through Ollama — fully offline</li>
            <li>Role-based access control for students and faculty</li>
            <li>Direct PDF link resolution for question papers and handouts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">How it Works</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            When you submit a query, the system first checks for a matching
            college document by keyword. If a PDF is found, a direct download
            link is returned. Otherwise, the query is embedded using
            <span className="font-medium text-foreground"> nomic-embed-text</span>, and
            the most relevant chunks are retrieved from the FAISS vector store.
            BM25 scores are fused with semantic scores, the top candidates are
            re-ranked with a CrossEncoder, and the final context is passed to
            <span className="font-medium text-foreground"> Mistral</span> running
            locally via Ollama to generate a grounded, accurate answer.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
