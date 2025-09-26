import fs from 'fs';
import path from 'path';
import type { ToolAdapter } from './types';

export function loadLocalAdapters(): Record<string, ToolAdapter> {
  const dir = path.join(__dirname, '..', 'adapters');
  const adapters: Record<string, ToolAdapter> = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
    if (file.includes('.d.ts')) continue;
    const mod = require(path.join(dir, file));
    const adapter: ToolAdapter = mod.default || mod.adapter || mod;
    if (adapter?.spec?.name) adapters[adapter.spec.name] = adapter;
  }
  return adapters;
}

export function loadCustomRegistry(): Record<string, any> {
  const p = path.join(__dirname, '..', 'config', 'tools.custom.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}
