import { Navbar } from "@/components/layout/Navbar";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register — SPMVV EDUBOT",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <RegisterForm />
      </main>
    </div>
  );
}
