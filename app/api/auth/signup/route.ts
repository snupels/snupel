import { authJson } from "@/lib/auth/route";
import { signupWithEmail } from "@/lib/auth/service";
import { SignupRequestSchema } from "@/schemas/auth";

export function POST(request: Request) {
  return authJson(request, SignupRequestSchema, signupWithEmail, 201);
}
