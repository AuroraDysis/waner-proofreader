import { NextResponse } from "next/server";
import { models } from "@/lib/config";

export async function GET() {
  try {
    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to load models" },
      { status: 500 }
    );
  }
}
