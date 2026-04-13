"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Trash2, RefreshCw, Upload } from "lucide-react";
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
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>Restricted</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No documents.
                </TableCell>
              </TableRow>
            )}
            {docs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.filename}</TableCell>
                <TableCell>{doc._count.chunks}</TableCell>
                <TableCell>
                  <Badge variant={doc.isRestricted ? "destructive" : "secondary"}>
                    {doc.isRestricted ? "Restricted" : "Public"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {doc.uploader?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIngest(doc.id)}
                      disabled={ingesting}
                    >
                      <RefreshCw className="size-3.5 mr-1" />
                      Re-ingest
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="rounded-xl border p-4 space-y-4">
        <h2 className="font-semibold">Upload Document</h2>
        <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="file">PDF File</Label>
            <input
              id="file"
              type="file"
              accept=".pdf"
              ref={fileRef}
              required
              className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => val && setCategory(val)}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge_base">Knowledge Base</SelectItem>
                <SelectItem value="subject_pdf">Subject PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Subject Code (optional)</Label>
            <Input
              id="code"
              placeholder="e.g. MATH101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Switch
              id="restricted"
              checked={restricted}
              onCheckedChange={setRestricted}
            />
            <Label htmlFor="restricted">Restricted (faculty only)</Label>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={uploading}>
              <Upload className="size-4 mr-1.5" />
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </div>

      {/* Documents list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Documents</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleIngest()}
            disabled={ingesting}
          >
            <RefreshCw className="size-4 mr-1.5" />
            {ingesting ? "Ingesting…" : "Re-ingest All"}
          </Button>
        </div>
        <Tabs defaultValue="knowledge_base">
          <TabsList>
            <TabsTrigger value="knowledge_base">
              Knowledge Base ({knowledgeDocs.length})
            </TabsTrigger>
            <TabsTrigger value="subject_pdf">
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
    </div>
  );
}
