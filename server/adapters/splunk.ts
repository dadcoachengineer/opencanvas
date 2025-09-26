import type { ToolAdapter } from '../core/types';

const SPLUNK_BASE = process.env.SPLUNK_BASE_URL || 'https://splunk:8089';
const AUTH = 'Basic ' + Buffer.from(`${process.env.SPLUNK_USER}:${process.env.SPLUNK_PASS}`).toString('base64');

const adapter: ToolAdapter = {
  spec: {
    name: 'splunk.search',
    description: 'Run a Splunk search query (oneshot).',
    requiresApproval: false
  },
  async call(args) {
    const { query } = args;
    const res = await fetch(`${SPLUNK_BASE}/services/search/jobs/export`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ search: query, output_mode: 'json' })
    });
    if (!res.ok) throw new Error(`Splunk ${res.status}`);
    return res.text();
  }
};
export default adapter;
