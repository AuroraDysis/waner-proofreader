import { parse } from "smol-toml";
import fs from "fs";
import type { Config } from "@/types";

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

let config: Config = { models: [], users: [] }; // Default empty config
if (config_content) {
  try {
    config = parse(config_content) as unknown as Config;
  } catch (parseError) {
    console.error("Failed to parse config content:", parseError);
  }
}
// --- End Config Loading ---

export const models = config.models || [];
export const users = config.users || [];
export const apiKeys = Array.isArray(config?.users)
  ? config.users.map((user) => user.key)
  : [];
