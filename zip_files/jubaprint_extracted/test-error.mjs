import express from 'express';

const app = express();
app.use(express.json());

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.post('/test', asyncHandler((req, res) => {
  throw new Error("Synchronous error!");
}));

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3002, () => console.log('Listening on 3002'));
