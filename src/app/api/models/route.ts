import { NextResponse } from "next/server";
import { models } from "@/lib/config";
import type { ModelApiResponse } from "@/types";

export async function GET() {
  const response: ModelApiResponse = { models };
  return NextResponse.json(response);
}
