import type { LLMProvider } from './provider';

const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

const AnthropicProvider: LLMProvider = {
  name: 'anthropic',
  async plan(prompt, tools) {
    const body = {
      model,
      max_tokens: 1024,
      system: 'You are a planner that outputs JSON plan steps.',
      messages: [
        { role: 'user', content: JSON.stringify({ prompt, tools }) }
      ]
    };
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data?.content?.[0]?.text || '[]';
  }
};
export default AnthropicProvider;
