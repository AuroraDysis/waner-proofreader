import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { apiKeys, models, users } from "@/lib/config";
import { generate_system_prompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";

// Allow streaming responses up to 5 minutes
export const maxDuration = 300;

interface RequestPayload {
  model: string;
  context: string;
  instruction: string;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

export async function POST(req: NextRequest) {
  const {
    model,
    context,
    instruction,
    prompt,
    endpoint,
    apiKey,
  }: RequestPayload = await req.json();

  let openaiBaseUrl = "";
  let openaiApiKey = "";

  if (apiKeys.includes(apiKey)) {
    const user = users.find((user) => user.key === apiKey)!;
    openaiBaseUrl = user.openai_base_url;
    openaiApiKey = user.openai_api_key;

    console.log("User", user.name, "is using the model", model);

    if (!models.includes(model)) {
      return new NextResponse(
        "Invalid model, Please provide your own api when using a custom model",
        {
          status: 400,
        }
      );
    }
  } else {
    openaiBaseUrl = endpoint || "https://api.openai.com/v1";
    openaiApiKey = apiKey;
  }

  if (!openaiBaseUrl || !openaiApiKey) {
    return new NextResponse("Invalid API key or endpoint", { status: 403 });
  }

  const openai = createOpenAI({
    baseURL: openaiBaseUrl,
    apiKey: openaiApiKey,
  });

  const result = streamText({
    model: openai(model),
    system: generate_system_prompt(context, instruction),
    prompt,
  });

  return result.toDataStreamResponse();
}
