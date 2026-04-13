import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if registration is enabled
    const registrationEnabled = await getSetting<boolean>("registration_enabled");
    if (!registrationEnabled) {
      return NextResponse.json(
        { message: "Registration is currently disabled" },
        { status: 403 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Validate email domain against allowedDomains table
    const emailDomain = normalizedEmail.split("@")[1];
    const allowedDomain = await prisma.allowedDomain.findFirst({
      where: { domain: emailDomain, isActive: true },
    });

    if (!allowedDomain) {
      return NextResponse.json(
        { message: "Email domain is not allowed for registration" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Get role — from request or default setting
    const roleName: string = role || (await getSetting<string>("default_role"));

    if (!roleName) {
      return NextResponse.json(
        { message: "No role available for registration" },
        { status: 400 }
      );
    }

    // Prevent self-registration as superadmin
    if (roleName.toLowerCase() === "superadmin") {
      return NextResponse.json(
        { message: "Cannot self-register as superadmin" },
        { status: 403 }
      );
    }

    const dbRole = await prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!dbRole) {
      return NextResponse.json(
        { message: "Specified role does not exist" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        roleId: dbRole.id,
      },
    });

    return NextResponse.json({ message: "Registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
