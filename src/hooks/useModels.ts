import { useState, useEffect } from "react";
import type { ModelApiResponse } from "@/types";

export function useModels() {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
        
        const data: ModelApiResponse = await response.json();
        setAvailableModels(data.models || []);
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setAvailableModels([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, []);
  
  return {
    models: availableModels,
    isLoading,
    error,
  };
}