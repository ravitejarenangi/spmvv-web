import { Navbar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThreeBackground } from "@/components/ui/ThreeBackground";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-transparent">
      <ThreeBackground />
      <div className="relative z-10 block">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative z-10 glass-panel border-t border-white/20">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-white/10 dark:bg-black/10 backdrop-blur-sm p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
