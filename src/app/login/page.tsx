import { Navbar } from "@/components/layout/Navbar";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login — SPMVV EDUBOT",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <LoginForm />
      </main>
    </div>
  );
}
