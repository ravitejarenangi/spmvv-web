import { FileDown } from "lucide-react";

interface PdfCardProps {
  subject: string;
  downloadUrl: string;
}

export function PdfCard({ subject, downloadUrl }: PdfCardProps) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm max-w-[75%]">
        <div className="flex-shrink-0 rounded-lg bg-red-50 p-2">
          <FileDown className="size-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{subject}</p>
          <p className="text-xs text-slate-500">PDF Document</p>
        </div>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
}
