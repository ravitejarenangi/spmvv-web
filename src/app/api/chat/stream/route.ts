import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { askStream } from "@/lib/rag";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.permissions.includes("chat:access")) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const streamingEnabled = await getSetting<boolean>("streaming_enabled");
  if (!streamingEnabled) {
    return new Response(JSON.stringify({ message: "Streaming is not enabled" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, sessionId } = await req.json();

  if (!message) {
    return new Response(JSON.stringify({ message: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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

  const permissions = session.user.permissions;
  const resolvedSessionId = chatSessionId;

  const stream = new ReadableStream({
    async start(controller) {
      const encode = (obj: unknown) => {
        const line = `data: ${JSON.stringify(obj)}\n\n`;
        controller.enqueue(new TextEncoder().encode(line));
      };

      try {
        // Send session id first
        encode({ type: "session", sessionId: resolvedSessionId });

        let accumulated = "";

        for await (const chunk of askStream(message, permissions)) {
          encode({ type: chunk.type, data: chunk.data, subject: chunk.subject });

          if (chunk.type === "token") {
            accumulated += chunk.data;
          } else if (chunk.type === "pdf") {
            accumulated = `[View ${chunk.subject ?? "document"}](${chunk.data})`;
          } else if (chunk.type === "text") {
            accumulated = chunk.data;
          }
        }

        // Save accumulated assistant message
        await prisma.chatMessage.create({
          data: {
            sessionId: resolvedSessionId,
            role: "assistant",
            content: accumulated,
          },
        });

        // Update session updatedAt
        await prisma.chatSession.update({
          where: { id: resolvedSessionId },
          data: { updatedAt: new Date() },
        });

        encode({ type: "done" });
      } catch (error) {
        console.error("Stream error:", error);
        encode({ type: "error", data: "An error occurred during streaming" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
