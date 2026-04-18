import { Navbar } from "@/components/layout/Navbar";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThreeBackground } from "@/components/ui/ThreeBackground";

export const metadata = {
  title: "Register — SPMVV EDUBOT",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent overflow-hidden">
      <ThreeBackground />
      <div className="relative z-20 block">
        <Navbar />
      </div>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <RegisterForm />
      </main>
    </div>
  );
}
