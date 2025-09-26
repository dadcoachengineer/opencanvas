import type { ToolAdapter } from '../core/types';

const MERAKI_BASE = process.env.MERAKI_BASE_URL || 'https://api.meraki.com/api/v1';

async function merakiFetch(path: string) {
  const res = await fetch(`${MERAKI_BASE}${path}`, {
    headers: { 'X-Cisco-Meraki-API-Key': process.env.MERAKI_API_KEY || '' }
  });
  if (!res.ok) throw new Error(`Meraki ${res.status}`);
  return res.json();
}

const adapter: ToolAdapter = {
  spec: {
    name: 'meraki.getClients',
    description: 'List clients on a network (networkId required).',
    requiresApproval: false
  },
  async call(args) {
    const { networkId } = args;
    return
