export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
        <span>&copy; {year} SPMVV EDUBOT. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Powered by <span className="font-medium text-primary">AI</span>
        </span>
      </div>
    </footer>
  );
}
