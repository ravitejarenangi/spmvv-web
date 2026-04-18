export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="glass-panel rounded-none border-t border-white/20 py-8 mt-auto z-10 w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
        <span>&copy; {year} SPMVV EDUBOT. All rights reserved.</span>
        <span className="flex items-center gap-1.5 p-2 px-4 rounded-full bg-white/10 dark:bg-black/10 border border-white/10">
          Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm">AI</span>
        </span>
      </div>
    </footer>
  );
}
