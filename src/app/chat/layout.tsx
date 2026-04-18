import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ThreeBackground } from "@/components/ui/ThreeBackground";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-transparent">
      <ThreeBackground />
      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative z-10 glass-panel border-t border-white/20">
        <ChatSidebar />
        <main className="flex-1 flex flex-col bg-white/10 dark:bg-black/10 backdrop-blur-sm overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
