import { FileDown, Download } from "lucide-react";

interface PdfCardProps {
  subject: string;
  downloadUrl: string;
}

export function PdfCard({ subject, downloadUrl }: PdfCardProps) {
  return (
    <div className="flex justify-start" style={{ animation: "fadeInUp 0.3s ease-out" }}>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-[75%] transition-all duration-200 hover:shadow-md hover:border-blue-200">
        <div className="flex-shrink-0 rounded-xl bg-red-50 p-3">
          <FileDown className="size-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{subject}</p>
          <p className="text-xs text-slate-500">PDF Document</p>
        </div>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Download className="size-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}
