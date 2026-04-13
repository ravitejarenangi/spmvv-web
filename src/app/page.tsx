import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to SPMVV EDUBOT
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Your AI-powered college assistant — get instant answers about
          academics, facilities, faculty, and more at Sri Padmavati Mahila
          Visvavidyalayam.
        </p>
        <Link href="/register">
          <Button size="lg" className="mt-8">Get Started</Button>
        </Link>
      </section>

      {/* Feature cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Instant College Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ask any question about departments, courses, timetables, or
              campus resources and get accurate answers in seconds.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Smart AI Retrieval</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Powered by RAG — semantic search over college documents combined
              with local Mistral LLM for precise, grounded responses.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Faculty &amp; Student Access</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Role-based access ensures students and faculty each see the
              information relevant to them, securely and privately.
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
