import type { LLMProvider } from './llm/provider';

export async function llmPlan(provider: LLMProvider, prompt: string, tools: any[]) {
  const json = await provider.plan(prompt, tools);
  try { return JSON.parse(json); } catch { return []; }
}
