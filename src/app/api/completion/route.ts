import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { generate_system_prompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import { models } from "@/lib/prompt";
import { parse } from "smol-toml";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

interface Config {
  users: User[];
}

interface User {
  name: string;
  key: string;
  openai_base_url: string;
  openai_api_key: string;
}

const config_b64string = process.env.CONFIG || "";
const config_buffer = Buffer.from(config_b64string, "base64");
const config = parse(config_buffer.toString("utf-8")) as unknown as Config;

interface RequestPayload {
  model: string;
  context: string;
  instruction: string;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

const apiKeys = Array.isArray(config?.users) ? config.users.map((user) => user.key) : [];

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
    const user = config.users.find((user) => user.key === apiKey)!;
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
