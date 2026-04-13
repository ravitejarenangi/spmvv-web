import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json().catch(() => ({}));

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: title ?? null,
      },
    });

    return NextResponse.json(chatSession, { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
