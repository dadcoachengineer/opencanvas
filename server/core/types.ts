import { z } from 'zod';

export type CanvasNode = {
  id: string;
  type: 'note' | 'chart' | 'widget';
  x: number; y: number;
  data: Record<string, any>;
  createdBy: string;
};

export type ToolSpec = {
  name: string;
  description: string;
  requiresApproval?: boolean;
  inputSchema?: any;
  outputSchema?: any;
};

export interface ToolAdapter {
  spec: ToolSpec;
  call: (args: any, ctx: { userId: string; room: string }) => Promise<any>;
}

export type LLMGoalPlan = Array<
  | { type: 'tool'; tool: string; args: Record<string, any> }
  | { type: 'canvas'; action: 'add-note' | 'add-widget'; data: any }
>;
