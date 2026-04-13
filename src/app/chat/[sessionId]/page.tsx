import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChatArea } from "@/components/chat/ChatArea";

interface PageProps {
  params: { sessionId: string };
}

export default async function ChatSessionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: params.sessionId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chatSession) {
    redirect("/chat");
  }

  const initialMessages = chatSession.messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    type: "text" as const,
  }));

  return (
    <ChatArea
      sessionId={chatSession.id}
      initialMessages={initialMessages}
    />
  );
}
