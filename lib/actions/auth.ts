"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { users, providerProfiles, notifications } from "@/db/schema";
import {
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export type ActionState = { error?: string; success?: string };

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const ip = String(formData.get("ip") || "unknown");
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }
  const { email, password } = parsed.data;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider/dashboard" : "/dashboard");
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    businessName: formData.get("businessName") || undefined,
    city: formData.get("city") || undefined,
  };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const ip = String(formData.get("ip") || "unknown");
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }
  const { name, email, password, role, businessName, city } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }
  const id = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ id, name, email, passwordHash, role });
  if (role === "provider") {
    await db.insert(providerProfiles).values({
      id: randomBytes(16).toString("hex"),
      userId: id,
      businessName: businessName!,
      city: city || null,
      status: "pending",
    });
    await db.insert(notifications).values({
      id: randomBytes(16).toString("hex"),
      userId: id,
      title: "Application received",
      body: "Your provider application is pending review by our admin team.",
      link: "/provider/dashboard",
    });
  } else {
    await db.insert(notifications).values({
      id: randomBytes(16).toString("hex"),
      userId: id,
      title: "Welcome to FIXORA",
      body: "Browse services and book trusted professionals for your home.",
      link: "/services",
    });
  }
  await createSession(id);
  redirect(role === "provider" ? "/provider/dashboard" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
