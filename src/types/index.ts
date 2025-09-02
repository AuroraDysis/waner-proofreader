export interface User {
  name: string;
  key: string;
  openai_base_url: string;
  openai_api_key: string;
}

export interface Config {
  models: string[];
  users: User[];
}

export interface ModelApiResponse {
  models: string[];
}

export interface ProofreadRequest {
  model: string;
  context: string;
  instruction: string;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

export interface Context {
  key: string;
  label: string;
  prompt: string;
  guidelines?: string;
}

export interface Instruction {
  key: string;
  prompt: string;
  description?: string;
}

export interface DiffSegment {
  type: "unchanged" | "added" | "removed";
  value: string;
}

export interface ProofreaderState {
  originalText: string;
  modifiedText: string;
  model: string | undefined;
  context: string;
  instruction: string;
  endpoint: string;
  apiKey: string;
  proofreadError: string | null;
  isLoading: boolean;
}

export interface EditorConfig {
  wordWrap: boolean;
  fontSize: number;
  lineNumbers: boolean;
  minimap: boolean;
}

export type ViewMode = "side-by-side" | "diff" | "tabs";
export type TabKey = "original" | "modified" | "diff";