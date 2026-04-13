import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ask } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.permissions.includes("chat:access")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // Create or get chat session
    let chatSessionId = sessionId as string | undefined;

    if (!chatSessionId) {
      const chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50),
        },
      });
      chatSessionId = chatSession.id;
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSessionId,
        role: "user",
        content: message,
      },
    });

    // Get RAG response
    const ragResponse = await ask(message, session.user.permissions);

    // Format assistant response content
    const assistantContent =
      ragResponse.type === "pdf"
        ? `[View ${ragResponse.subject ?? "document"}](${ragResponse.data})`
        : ragResponse.data;

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSessionId,
        role: "assistant",
        content: assistantContent,
      },
    });

    // Update session updatedAt
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      type: ragResponse.type,
      data: ragResponse.data,
      subject: ragResponse.subject,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
