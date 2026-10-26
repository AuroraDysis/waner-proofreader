import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { apiKeys, model, users } from "@/lib/config";
import { generate_system_prompt } from "@/lib/prompt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    context,
    instruction,
    mathFormat,
    prompt,
    endpoint,
    apiKey,
    model: customModel,
  } = await req.json();

  let openaiBaseUrl = "";
  let openaiApiKey = "";
  let selectedModel = model;

  if (apiKeys.includes(apiKey)) {
    const user = users.find((user) => user.key === apiKey);

    if (!user) {
      return new NextResponse("Invalid API key", { status: 403 });
    }

    openaiBaseUrl = user.openai_base_url;
    openaiApiKey = user.openai_api_key;

    console.log("User", user.name, "is using the model", model);
  } else {
    // Only users with their own key may choose the model.
    openaiBaseUrl = endpoint || "https://openrouter.ai/api/v1";
    openaiApiKey = apiKey;
    selectedModel = customModel?.trim() || model;
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
    model: provider(selectedModel),
    system: generate_system_prompt(context, instruction, mathFormat),
    prompt,
  });

  return response.toTextStreamResponse();
}
