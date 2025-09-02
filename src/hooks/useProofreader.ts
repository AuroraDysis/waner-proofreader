import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import useLocalStorageState from "use-local-storage-state";

export interface ProofreaderConfig {
  model: string;
  context: string;
  instruction: string;
  endpoint: string;
  apiKey: string;
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

  const [model, setModel] = useLocalStorageState<string | undefined>("model", {
    defaultValue: undefined,
  });

  const [context, setContext] = useLocalStorageState("context", {
    defaultValue: "general",
  });

  const [instruction, setInstruction] = useLocalStorageState("instruction", {
    defaultValue: "basicProofread",
  });

  const [endpoint, setEndpoint] = useLocalStorageState("endpoint", {
    defaultValue: "",
  });

  const [apiKey, setApiKey] = useLocalStorageState("apiKey", {
    defaultValue: "",
  });

  const { complete, isLoading, stop } = useCompletion({
    streamProtocol: "text",
    api: "/api/completion",
    onError: (error) => {
      setProofreadError(error.message);
    },
    onFinish: (_prompt, completion) => {
      setProofreadError(null);
      setModifiedText(completion);
    },
  });

  const proofread = useCallback(async () => {
    if (!model || !originalText.trim()) {
      setProofreadError("Please select a model and enter text to proofread");
      return;
    }

    try {
      // Clear previous error so a repeated error can re-trigger modal
      setProofreadError(null);
      await complete(originalText, {
        body: {
          model,
          context,
          instruction,
          endpoint,
          apiKey,
        },
      });
    } catch (error) {
      console.error("Proofreading failed:", error);
      setProofreadError(
        error instanceof Error ? error.message : "Proofreading failed"
      );
    }
  }, [
    model,
    originalText,
    context,
    instruction,
    endpoint,
    apiKey,
    complete,
  ]);

  return {
    originalText,
    setOriginalText,
    modifiedText,
    setModifiedText,
    model,
    setModel,
    context,
    setContext,
    instruction,
    setInstruction,
    endpoint,
    setEndpoint,
    apiKey,
    setApiKey,
    proofreadError,
    setProofreadError,
    isLoading,
    proofread,
    stop,
  };
}
