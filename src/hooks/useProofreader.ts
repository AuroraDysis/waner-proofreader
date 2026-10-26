import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import useLocalStorageState from "use-local-storage-state";
import {
  OPTIONS_VERSION,
  resolve_context,
  resolve_instruction,
} from "@/lib/prompt";
import type { MathFormat } from "@/types";

export interface ProofreaderConfig {
  context: string;
  instruction: string;
  mathFormat: MathFormat;
  endpoint: string;
  apiKey: string;
  model: string;
}

export function useProofreader() {
  const [proofreadError, setProofreadError] = useState<string | null>(null);

  const [originalText, setOriginalText] = useLocalStorageState<string>(
    "originalText",
    { defaultValue: "" }
  );

  const [modifiedText, setModifiedText] = useLocalStorageState<string>(
    "modifiedText",
    { defaultValue: "" }
  );

  const [storedContext, setContext] = useLocalStorageState(
    `context-v${OPTIONS_VERSION}`,
    { defaultValue: "general" }
  );
  const context = resolve_context(storedContext).key;

  const [storedInstruction, setInstruction] = useLocalStorageState(
    `instruction-v${OPTIONS_VERSION}`,
    { defaultValue: "proofread" }
  );
  const instruction = resolve_instruction(storedInstruction).key;

  const selectContext = useCallback(
    (key: string) => {
      setContext(key);
      setInstruction(resolve_context(key).defaultInstruction);
    },
    [setContext, setInstruction]
  );

  const [mathFormat, setMathFormat] = useLocalStorageState<MathFormat>(
    "mathFormat",
    { defaultValue: "latex" }
  );

  const [endpoint, setEndpoint] = useLocalStorageState("endpoint", {
    defaultValue: "",
  });

  const [apiKey, setApiKey] = useLocalStorageState("apiKey", {
    defaultValue: "",
  });

  // Only sent with the user's own API key; empty means the default model.
  const [model, setModel] = useLocalStorageState("customModel", {
    defaultValue: "",
  });

  const { complete, completion, isLoading, stop } = useCompletion({
    streamProtocol: "text",
    api: "/api/completion",
    experimental_throttle: 100,
    onError: (error) => {
      setProofreadError(error.message);
    },
    onFinish: (_prompt, completion) => {
      // A provider error inside the stream (e.g. an unknown model) ends it with no
      // text; keep the previous suggestion instead of replacing it with nothing.
      if (!completion.trim()) {
        setProofreadError(
          "The model returned no text. Check the model name and API key in Settings."
        );
        return;
      }
      setProofreadError(null);
      setModifiedText(completion);
    },
  });

  // During streaming, use the live completion value; after finish, use persisted modifiedText
  const streamingText = isLoading && completion ? completion : modifiedText;

  const proofread = useCallback(async () => {
    if (!originalText.trim()) {
      setProofreadError("Please enter text to proofread");
      return;
    }

    try {
      // Clear previous error so a repeated error can re-trigger modal
      setProofreadError(null);
      await complete(originalText, {
        body: {
          context,
          instruction,
          mathFormat,
          endpoint,
          apiKey,
          model,
        },
      });
    } catch (error) {
      console.error("Proofreading failed:", error);
      setProofreadError(
        error instanceof Error ? error.message : "Proofreading failed"
      );
    }
  }, [
    originalText,
    context,
    instruction,
    mathFormat,
    endpoint,
    apiKey,
    model,
    complete,
  ]);

  return {
    originalText,
    setOriginalText,
    modifiedText,
    setModifiedText,
    context,
    setContext: selectContext,
    instruction,
    setInstruction,
    mathFormat,
    setMathFormat,
    endpoint,
    setEndpoint,
    apiKey,
    setApiKey,
    model,
    setModel,
    proofreadError,
    setProofreadError,
    isLoading,
    proofread,
    stop,
    streamingText,
  };
}
