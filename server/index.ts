import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';

export type CanvasNode = {
  id: string;
  type: 'note' | 'chart' | 'widget';
  x: number;
  y: number;
  data: Record<string, any>;
  createdBy: string;
};

const rooms: Record<string, { nodes: CanvasNode[]; history: any[] }> = {};

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  let room = 'default';
  let userId = nanoid(6);

  socket.on('join', (r: string) => {
    room = r || 'default';
    if (!rooms[room]) rooms[room] = { nodes: [], history: [] };
    socket.join(room);
    socket.emit('state', rooms[room]);
    socket.emit('tools:list', [
      { name: 'ping', description: 'Health check' },
      { name: 'queryMetrics', description: 'Simulated metrics query' },
      { name: 'remediateConfig', description: 'Propose config change', requiresApproval: true }
    ]);
  });

  socket.on('canvas:add', (node: Omit<CanvasNode, 'id' | 'createdBy'>) => {
    const newNode: CanvasNode = { ...node, id: nanoid(8), createdBy: userId };
    rooms[room].nodes.push(newNode);
    io.to(room).emit('canvas:added', newNode);
  });

  socket.on('agent:goal', async (goal: string) => {
    if (goal.toLowerCase().includes('latency')) {
      const data = { points: Array.from({ length: 10 }, (_, i) => ({ t: Date.now() - i*60000, v: Math.random()*100 })) };
      const newNode: CanvasNode = { id: nanoid(8), type: 'chart', x: 100, y: 100, data, createdBy: userId };
      rooms[room].nodes.push(newNode);
      io.to(room).emit('canvas:added', newNode);
    } else {
      const newNode: CanvasNode = { id: nanoid(8), type: 'note', x: 120, y: 150, data: { text: `Goal: ${goal}` }, createdBy: userId };
      rooms[room].nodes.push(newNode);
      io.to(room).emit('canvas:added', newNode);
    }
  });

  socket.on('tool:invoke', async ({ tool, args, requestId }) => {
    if (tool === 'ping') {
      io.to(room).emit('tool:result', { requestId, ok: true, data: { now: new Date().toISOString() } });
    } else if (tool === 'remediateConfig') {
      io.to(room).emit('tool:result', { requestId, ok: true, data: { applied: true, details: args } });
    } else {
      io.to(room).emit('tool:result', { requestId, ok: false, error: 'Unknown tool' });
    }
  });
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5057;
server.listen(PORT, () => console.log(`Server listening on http://0.0.0.0:${PORT}`));
