export interface User {
  name: string;
  key: string;
  openai_base_url: string;
  openai_api_key: string;
}

export interface Config {
  model?: string;
  users: User[];
}

export type MathFormat = "latex" | "unicode";

export interface MathFormatOption {
  key: MathFormat;
  label: string;
  prompt: string;
}

export interface ProofreadRequest {
  context: string;
  instruction: string;
  mathFormat: MathFormat;
  prompt: string;
  endpoint: string;
  apiKey: string;
}

export interface Context {
  key: string;
  label: string;
  prompt: string;
  // Edit strength selected when the user switches to this context.
  defaultInstruction: string;
}

export interface Instruction {
  key: string;
  label: string;
  prompt: string;
}

export interface DiffSegment {
  type: "unchanged" | "added" | "removed";
  value: string;
}

export interface ProofreaderState {
  originalText: string;
  modifiedText: string;
  context: string;
  instruction: string;
  mathFormat: MathFormat;
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