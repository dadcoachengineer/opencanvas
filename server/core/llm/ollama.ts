import type { LLMProvider } from './provider';

const OllamaProvider: LLMProvider = {
  name: 'ollama',
  async plan(prompt, tools) {
    const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    const res = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://ollama:11434'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a planner that outputs JSON plan steps.' },
          { role: 'user', content: JSON.stringify({ prompt, tools }) }
        ],
        format: 'json'
      })
    });
    const data = await res.json();
    return data?.message?.content || '[]';
  }
};
export default OllamaProvider;
