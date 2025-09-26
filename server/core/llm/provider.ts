export interface LLMProvider {
  name: string;
  plan: (prompt: string, tools: any[]) => Promise<string>;
}
