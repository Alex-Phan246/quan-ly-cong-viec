import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { router } from './routes/index.js';
import { resetInMemoryStore, getSeed } from './utils/seed.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Seed reset endpoint (for dev)
app.post('/__reset', (req, res) => {
  resetInMemoryStore();
  return res.json({ ok: true, seed: getSeed() });
});

app.use('/api', router);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`);
});
