import argon2 from "argon2";

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash.startsWith("$argon2")) {
    return false;
  }

  return argon2.verify(passwordHash, password);
}
