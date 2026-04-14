import { Navbar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{children}</main>
      </div>
    </div>
  );
}
