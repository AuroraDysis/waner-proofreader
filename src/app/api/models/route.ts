import { NextResponse } from "next/server";
import { models } from "@/lib/config";

export async function GET() {
  return NextResponse.json({ models });
}
