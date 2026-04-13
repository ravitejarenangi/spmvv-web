import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    await prisma.chatSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Session deleted" });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
