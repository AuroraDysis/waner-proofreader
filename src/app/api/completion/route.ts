import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { apiKeys, models, users } from "@/lib/config";
import { generate_system_prompt } from "@/lib/prompt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    model,
    context,
    instruction,
    prompt,
    endpoint,
    apiKey,
  } = await req.json();

  let openaiBaseUrl = "";
  let openaiApiKey = "";

  if (apiKeys.includes(apiKey)) {
    const user = users.find((user) => user.key === apiKey);

    if (!user) {
      return new NextResponse("Invalid API key", { status: 403 });
    }

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

  const provider = createOpenAICompatible({
    name: openaiBaseUrl,
    baseURL: openaiBaseUrl,
    apiKey: openaiApiKey,
  });

  const response = streamText({
    model: provider(model),
    system: generate_system_prompt(context, instruction),
    prompt,
  });

  return response.toTextStreamResponse();
}
