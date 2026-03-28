"use server";

import { redirect } from "next/navigation";
import { getSession } from "./session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  await session.save();

  const routes: Record<string, string> = {
    staff: "/board",
    manager: "/manager",
    guest: "/guest",
  };
  redirect(routes[user.role]);
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
