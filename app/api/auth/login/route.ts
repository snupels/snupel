import { authJson } from "@/lib/auth/route";
import { loginWithEmail } from "@/lib/auth/service";
import { LoginRequestSchema } from "@/schemas/auth";

export function POST(request: Request) {
  return authJson(request, LoginRequestSchema, loginWithEmail);
}
