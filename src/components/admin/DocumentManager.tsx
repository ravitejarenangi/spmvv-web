"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Trash2, RefreshCw, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
  id: string;
  filename: string;
  category: string;
  subject: string | null;
  code: string | null;
  isRestricted: boolean;
  createdAt: string;
  uploader: { id: string; name: string; email: string } | null;
  _count: { chunks: number };
}

interface DocumentManagerProps {
  initialDocuments: Document[];
}

export function DocumentManager({ initialDocuments }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [category, setCategory] = useState("knowledge_base");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");
  const [restricted, setRestricted] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const knowledgeDocs = documents.filter((d) => d.category === "knowledge_base");
  const subjectDocs = documents.filter((d) => d.category === "subject_pdf");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);
      if (subject) form.append("subject", subject);
      if (code) form.append("code", code);
      form.append("isRestricted", String(restricted));

      const res = await fetch("/api/admin/documents", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Upload failed");
      }
      const data = await res.json();
      setDocuments((prev) => [data.document, ...prev]);
      setSubject("");
      setCode("");
      setRestricted(false);
      setSelectedFileName(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Document uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Delete failed");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleIngest(documentId?: string) {
    setIngesting(true);
    try {
      const res = await fetch("/api/admin/documents/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentId ? { documentId } : {}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Ingestion failed");
      }
      toast.success(documentId ? "Document re-ingested" : "All documents re-ingested");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ingestion failed");
    } finally {
      setIngesting(false);
    }
  }

  function DocumentTable({ docs }: { docs: Document[] }) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Filename
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Chunks
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Access
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Uploader
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <FileText className="size-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium">No documents uploaded yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              docs.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <FileText className="size-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{doc.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc._count.chunks > 0 ? "default" : "secondary"}
                      className={
                        doc._count.chunks > 0
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100 border-0"
                      }
                    >
                      {doc._count.chunks}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={doc.isRestricted ? "destructive" : "secondary"}
                      className={
                        doc.isRestricted
                          ? "bg-red-100 text-red-700 hover:bg-red-100 border-0"
                          : "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                      }
                    >
                      {doc.isRestricted ? "Restricted" : "Public"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {doc.uploader?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIngest(doc.id)}
                        disabled={ingesting}
                        className="h-8 text-xs border-slate-200 text-slate-600 hover:text-slate-900"
                      >
                        <RefreshCw className="size-3.5 mr-1.5" />
                        Re-ingest
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Upload className="size-4 text-white" />
          </div>
          <h2 className="font-semibold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            Upload Document
          </h2>
        </div>
        <form onSubmit={handleUpload} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* File input */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-slate-700">PDF File</Label>
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  id="file"
                  type="file"
                  accept=".pdf"
                  ref={fileRef}
                  required
                  className="hidden"
                  onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? null)}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <Upload className="size-5 text-slate-400" />
                  </div>
                  {selectedFileName ? (
                    <p className="text-sm font-medium text-blue-600">{selectedFileName}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-700">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-xs text-slate-400">PDF files only</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(val: string | null) => val && setCategory(val)}
              >
                <SelectTrigger id="category" className="w-full border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knowledge_base">Knowledge Base</SelectItem>
                  <SelectItem value="subject_pdf">Subject PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject + Code side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g. Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-slate-700">
                  Subject Code
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. MATH101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border-slate-200"
                />
              </div>
            </div>

            {/* Restricted toggle */}
            <div className="flex items-center gap-3 md:col-span-2 py-1">
              <Switch
                id="restricted"
                checked={restricted}
                onCheckedChange={setRestricted}
              />
              <div>
                <Label htmlFor="restricted" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Restricted access
                </Label>
                <p className="text-xs text-slate-400">Only faculty members can access this document</p>
              </div>
            </div>
          </div>

          {/* Upload button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-6"
            >
              <Upload className="size-4 mr-2" />
              {uploading ? "Uploading…" : "Upload Document"}
            </Button>
          </div>
        </form>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{documents.length}</span>{" "}
          {documents.length === 1 ? "document" : "documents"} total
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleIngest()}
          disabled={ingesting}
          className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <RefreshCw className="size-4 mr-2" />
          {ingesting ? "Ingesting…" : "Re-ingest All"}
        </Button>
      </div>

      {/* Document Tables */}
      <Tabs defaultValue="knowledge_base" className="w-full flex flex-col">
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-lg w-fit">
          <TabsTrigger
            value="knowledge_base"
            className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900"
          >
            Knowledge Base ({knowledgeDocs.length})
          </TabsTrigger>
          <TabsTrigger
            value="subject_pdf"
            className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900"
          >
            Subject PDFs ({subjectDocs.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="knowledge_base">
          <DocumentTable docs={knowledgeDocs} />
        </TabsContent>
        <TabsContent value="subject_pdf">
          <DocumentTable docs={subjectDocs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
