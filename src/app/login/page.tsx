import { Navbar } from "@/components/layout/Navbar";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThreeBackground } from "@/components/ui/ThreeBackground";

export const metadata = {
  title: "Login — SPMVV EDUBOT",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <ThreeBackground />
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 z-10">
        <LoginForm />
      </main>
    </div>
  );
}
