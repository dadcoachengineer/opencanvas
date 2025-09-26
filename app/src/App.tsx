import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';

type CanvasNode = {
  id: string;
  type: 'note' | 'chart' | 'widget';
  x: number;
  y: number;
  data: Record<string, any>;
  createdBy: string;
};

type ToolSpec = {
  name: string;
  description: string;
  requiresApproval?: boolean;
  inputSchema?: any;
};

type PlanStep =
  | { type: 'tool'; tool: string; args: Record<string, any> }
  | { type: 'canvas'; action: 'add-note'; data: any };

type ToolApproval = { requestId: string; tool: string; args: any };

type ToolResult = { requestId: string; ok: boolean; data?: any; error?: string };

const socket: Socket = io('http://localhost:5057', { transports: ['websocket'] });

export default function App() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [tools, setTools] = useState<ToolSpec[]>([]);
  const [goal, setGoal] = useState('Show me p95 latency for payments in the last 30m');
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [approvals, setApprovals] = useState<ToolApproval[]>([]);
  const [results, setResults] = useState<Record<string, ToolResult>>({});

  useEffect(() => {
    socket.emit('join', 'default');

    socket.on('state', (s: { nodes: CanvasNode[] }) => setNodes(s.nodes));
    socket.on('tools:list', (t: ToolSpec[]) => setTools(t));
    socket.on('canvas:added', (n: CanvasNode) => setNodes(prev => [...prev, n]));
    socket.on('canvas:updated', (n: CanvasNode) => setNodes(prev => prev.map(p => p.id === n.id ? n : p)));

    socket.on('agent:plan', (steps: PlanStep[]) => setPlan(steps));
    socket.on('tool:approval', (a: ToolApproval) => setApprovals(prev => [...prev, a]));
    socket.on('tool:result', (r: ToolResult) => setResults(prev => ({ ...prev, [r.requestId]: r })));

    return () => { socket.off(); };
  }, []);

  const addNote = () => {
    socket.emit('canvas:add', {
      type: 'note',
      x: 60 + Math.random() * 500,
      y: 60 + Math.random() * 300,
      data: { text: 'New note' }
    });
  };

  const sendGoal = () => {
    setPlan([]);
    setApprovals([]);
    setResults({});
    socket.emit('agent:goal', goal);
  };

  const approve = (a: ToolApproval) => {
    socket.emit('tool:invoke', { tool: a.tool, args: a.args, requestId: a.requestId, userId: nanoid(6) });
    setApprovals(prev => prev.filter(x => x.requestId !== a.requestId));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ borderRight: '1px solid #eee', padding: 12 }}>
        <h3>Tools</h3>
        <ul>
          {tools.map(t => (
            <li key={t.name} title={t.description}>
              <strong>{t.name}</strong> {t.requiresApproval ? '🔒' : ''}
              <div style={{ color: '#666', fontSize: 12 }}>{t.description}</div>
            </li>
          ))}
        </ul>

        <h3>Agent Goal</h3>
        <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={5} style={{ width: '100%' }} />
        <button onClick={sendGoal} style={{ marginTop: 8 }}>Run Plan</button>

        {plan.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h4>Planned Steps</h4>
            <ol>
              {plan.map((s, i) => (
                <li key={i}>
                  {s.type === 'tool' ? `TOOL ${s.tool} ← ${JSON.stringify(s.args)}` : `CANVAS: ${s.action}`}
                </li>
              ))}
            </ol>
          </div>
        )}

        {approvals.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h4>Awaiting Approval</h4>
            {approvals.map(a => (
              <div key={a.requestId} style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                <div><b>{a.tool}</b></div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(a.args, null, 2)}</pre>
                <button onClick={() => approve(a)}>Approve</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', overflow: 'auto', background: 'linear-gradient(white, #fff)' }}>
        <div style={{ position: 'sticky', top: 10, left: 10, padding: 8 }}>
          <button onClick={addNote}>+ Note</button>
        </div>
        {nodes.map(n => (
          <CanvasCard key={n.id} node={n} />
        ))}
      </div>

      <div style={{ borderLeft: '1px solid #eee', padding: 12 }}>
        <h3>Results</h3>
        {Object.values(results).length === 0 ? <div>No results yet.</div> : (
          Object.values(results).map(r => (
            <div key={r.requestId} style={{ border: '1px solid #ddd', marginBottom: 8, padding: 8, borderRadius: 8 }}>
              <div><b>{r.ok ? '✅ OK' : '❌ Error'}</b> <small>req:{r.requestId}</small></div>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(r, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CanvasCard({ node }: { node: CanvasNode }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.x,
    top: node.y,
    width: 260,
    background: '#fff',
    border: '1px solid #e6e6e6',
    borderRadius: 12,
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
    padding: 12
  };

  if (node.type === 'note') {
    return (
      <div style={style}>
        <div style={{ fontSize: 12, color: '#888' }}>Note • {node.id}</div>
        <div style={{ marginTop: 6 }}>{node.data.text}</div>
      </div>
    );
  }

  if (node.type === 'chart') {
    return (
      <div style={style}>
        <div style={{ fontSize: 12, color: '#888' }}>Chart • {node.id}</div>
        <pre style={{ fontSize: 12 }}>{JSON.stringify(node.data, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={style}>
      <div style={{ fontSize: 12, color: '#888' }}>Widget • {node.id}</div>
      <pre style={{ fontSize: 12 }}>{JSON.stringify(node.data, null, 2)}</pre>
    </div>
  );
}
