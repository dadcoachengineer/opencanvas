import type { ToolAdapter } from '../core/types';

const NOW_BASE = process.env.SNOW_BASE_URL || 'https://instance.service-now.com';
const AUTH = 'Basic ' + Buffer.from(`${process.env.SNOW_USER}:${process.env.SNOW_PASS}`).toString('base64');

const adapter: ToolAdapter = {
  spec: {
    name: 'servicenow.createIncident',
    description: 'Create a ServiceNow incident.',
    requiresApproval: true
  },
  async call(args) {
    const res = await fetch(`${NOW_BASE}/api/now/table/incident`, {
      method: 'POST',
      headers: { 'Authorization': AUTH, 'Content-Type': '
