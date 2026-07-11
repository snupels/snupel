import { NextRequest } from "next/server";
import { badRequest, created, json } from "@/lib/api";
import { validateCollectedStampPayload } from "@/lib/validators";
import { getCollectedStamps, createCollectedStamp } from "@/lib/queries";

export async function GET() {
  return json(await getCollectedStamps());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validation = validateCollectedStampPayload(body);
  if ("error" in validation) {
    return badRequest(validation.error);
  }

  const collectedStamp = await createCollectedStamp(validation.data);
  return created(collectedStamp);
}
