import type { ToolAdapter } from '../core/types';

const MIST_BASE = process.env.MIST_BASE_URL || 'https://api.mist.com/api/v1';

const adapter: ToolAdapter = {
  spec: {
    name: 'juniper.mistOrgs',
    description: 'List Juniper Mist organizations accessible to token.',
    requiresApproval: false
  },
  async call() {
    const res = await fetch(`${MIST_BASE}/self/orgs`, {
      headers: { 'Authorization': `Token ${process.env.MIST_API_TOKEN || ''}` }
    });
    if (!res.ok) throw new Error(`Mist ${res.status}`);
    return res.json();
  }
};
export default adapter;
