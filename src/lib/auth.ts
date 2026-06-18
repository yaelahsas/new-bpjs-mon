import { createHash, randomBytes } from "crypto";

const SESSION_TOKEN_KEY = "bpjs_session_token";
const sessions = new Map<string, { token: string; created: number }>();

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const envPassword = process.env.DASHBOARD_PASSWORD ?? "admin123";
  return password === envPassword;
}

export function createSession(): string {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { token, created: Date.now() });
  return token;
}

export function validateSession(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  // Session valid for 24 hours
  if (Date.now() - session.created > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function deleteSession(token: string) {
  sessions.delete(token);
}

export function getSessionCookieName(): string {
  return SESSION_TOKEN_KEY;
}
