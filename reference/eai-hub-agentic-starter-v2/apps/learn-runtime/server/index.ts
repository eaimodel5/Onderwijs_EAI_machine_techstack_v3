import express from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

app.post('/api/openai-secondary', async (req, res) => {
  const apiKey = req.headers['x-api-key'] as string;
  const payload = req.body;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await openaiRes.json();
  res.status(openaiRes.status).json(data);
});

app.get('/api/test-supabase', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('emotion_seeds')
      .select('id')
      .limit(1);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

\nimport educationRouter from './educationRuntime';\napp.use('/api', educationRouter);\napp.listen(3001, () => console.log('Proxy listening on :3001'));
