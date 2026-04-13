import { FileDown } from "lucide-react";

interface PdfCardProps {
  subject: string;
  downloadUrl: string;
}

export function PdfCard({ subject, downloadUrl }: PdfCardProps) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 shadow-sm max-w-[75%]">
        <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2">
          <FileDown className="size-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{subject}</p>
          <p className="text-xs text-muted-foreground">PDF Document</p>
        </div>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
}
