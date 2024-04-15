import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import { env } from "@/env";
import { syncAll } from "@/lib/sync/all";

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: NextRequest) {
  const { secret } = await request.json();
  const authSecret = env.AUTH_SECRET;

  if (secret !== authSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const syncResults = await syncAll();

  revalidatePath("/admin/sync");

  return Response.json({ data: syncResults });
}
