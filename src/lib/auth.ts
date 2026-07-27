import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "pixelcode-super-secret-key-change-in-production-2026";

export interface UserPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPassword);
}

export function createSessionToken(user: UserPayload): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifySessionToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    return null;
  }
}
