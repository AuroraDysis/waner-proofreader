import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { generate_system_prompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import { models } from "@/lib/prompt";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

interface RequestPayload {
  model: string;
  context: string;
  instruction: string;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

const apiKeys = process.env.API_KEY?.split(",") || [];

export async function POST(req: NextRequest) {
  const {
    model,
    context,
    instruction,
    prompt,
    endpoint,
    apiKey,
  }: RequestPayload = await req.json();

  let baseURL = "";
  let openaiApiKey = "";

  if (apiKeys.includes(apiKey)) {
    baseURL = process.env.OPENAI_BASE_URL!;
    openaiApiKey = process.env.OPENAI_API_KEY!;

    if (!models.includes(model)) {
      return new NextResponse(
        "Invalid model, Please provide your own api when using a custom model",
        {
          status: 400,
        }
      );
    }
  } else {
    baseURL = endpoint || process.env.OPENAI_BASE_URL!;
    openaiApiKey = apiKey;
  }

  if (!baseURL || !openaiApiKey) {
    return new NextResponse("Invalid API key or endpoint", { status: 403 });
  }

  const openai = createOpenAI({
    baseURL: baseURL,
    apiKey: openaiApiKey,
  });

  const result = streamText({
    model: openai(model),
    system: generate_system_prompt(context, instruction),
    prompt,
  });

  return result.toDataStreamResponse();
}
