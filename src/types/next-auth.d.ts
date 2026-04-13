import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      roleId: string;
      permissions: string[];
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    roleId: string;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roleId: string;
    permissions: string[];
  }
}
