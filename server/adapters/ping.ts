import type { ToolAdapter } from '../core/types';

const adapter: ToolAdapter = {
  spec: { name: 'ping', description: 'Health check tool' },
  async call() { return { now: new Date().toISOString() }; }
};
export default adapter;
