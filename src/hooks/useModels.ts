import useSWRImmutable from "swr/immutable";
import type { ModelApiResponse } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);
    return res.json() as Promise<ModelApiResponse>;
  });

export function useModels() {
  const { data, error, isLoading } = useSWRImmutable("/api/models", fetcher);

  return {
    models: data?.models ?? [],
    isLoading,
    error: error instanceof Error ? error.message : error ? "Unknown error occurred" : null,
  };
}
