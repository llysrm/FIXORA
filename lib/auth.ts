import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { randomBytes, createHash } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sessions, users, providerProfiles } from "@/db/schema";

const SESSION_COOKIE = "fixora_session";
const SESSION_DAYS = 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const id = randomBytes(16).toString("hex");
  await db.insert(sessions).values({ id, userId, token: hashToken(token), expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "provider" | "admin";
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      address: users.address,
      avatarUrl: users.avatarUrl,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(role: "customer" | "provider" | "admin"): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw new Error("FORBIDDEN");
  return user;
}

export async function getApprovedProviderProfile(userId: string) {
  const rows = await db
    .select()
    .from(providerProfiles)
    .where(and(eq(providerProfiles.userId, userId), eq(providerProfiles.status, "approved")))
    .limit(1);
  return rows[0] ?? null;
}
