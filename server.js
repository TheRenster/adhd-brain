const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '.nte-data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');
const APP_FILE = path.join(__dirname, 'index.html');

app.use(express.json({ limit: '2mb' }));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

function writeState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', (_req, res) => {
  res.json({ state: readState() });
});

app.post('/api/state', (req, res) => {
  const state = req.body?.state;
  if (!state || typeof state !== 'object') {
    return res.status(400).json({ error: 'Invalid state payload.' });
  }
  writeState(state);
  return res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.sendFile(APP_FILE);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`NTE app running at http://localhost:${PORT}`);
});
