import express from 'express';

const app = express();
app.use(express.json());

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.post('/test', asyncHandler((req: any, res: any) => {
  throw new Error("Synchronous error!");
}));

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).json({ error: err.message });
});

const server = app.listen(3002, async () => {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('http://localhost:3002/test', { method: 'POST' });
  console.log('STATUS:', res.status);
  console.log('BODY:', await res.text());
  server.close();
});
