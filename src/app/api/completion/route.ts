import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { generate_system_prompt } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import { models } from "@/lib/prompt";
import { parse } from "smol-toml";
import fs from "fs";

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

// --- Config Loading ---
let config_content: string;
const config_input = process.env.CONFIG || "";

try {
  // Attempt to read CONFIG as a file path
  config_content = fs.readFileSync(config_input, "utf-8");
  console.log(`Loaded config from path: ${config_input}`);
} catch (_error) {
  // If reading fails, assume it's a base64 string
  console.log(
    "CONFIG is not a valid path or file is unreadable, attempting base64 decode."
  );
  try {
    const config_buffer = Buffer.from(config_input, "base64");
    config_content = config_buffer.toString("utf-8");
    if (!config_content && config_input) {
      // Handle case where input was not empty but decoding resulted in empty string (invalid base64)
      throw new Error("Invalid base64 string in CONFIG environment variable.");
    } else if (!config_input) {
      console.warn("CONFIG environment variable is empty.");
      config_content = ""; // Ensure config_content is an empty string if CONFIG was empty
    }
  } catch (base64Error) {
    console.error("Failed to decode CONFIG as base64:", base64Error);
    // Set default empty config or handle error appropriately
    config_content = ""; // Default to empty string if decoding fails
  }
}

let config: Config = { users: [] }; // Default empty config
if (config_content) {
  try {
    config = parse(config_content) as unknown as Config;
  } catch (parseError) {
    console.error("Failed to parse config content:", parseError);
  }
}
// --- End Config Loading ---

interface RequestPayload {
  model: string;
  context: string;
  instruction: string;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

const apiKeys = Array.isArray(config?.users)
  ? config.users.map((user) => user.key)
  : [];

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
