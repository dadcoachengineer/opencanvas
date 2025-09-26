import type { LLMProvider } from './provider';

const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const OpenAIProvider: LLMProvider = {
  name: 'openai',
  async plan(prompt, tools) {
    const body = {
      model,
      messages: [
        { role: 'system', content: 'You are a planner that outputs JSON plan steps.' },
        { role: 'user', content: JSON.stringify({ prompt, tools }) }
      ],
      response_format: { type: 'json_object' }
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '[]';
  }
};
export default OpenAIProvider;
