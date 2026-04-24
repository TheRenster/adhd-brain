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
    if (!fs.existsSync(DATA_FILE)) return { state: {}, updatedAt: 0 };
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (parsed && typeof parsed === 'object' && parsed.state) {
      return { state: parsed.state, updatedAt: Number(parsed.updatedAt || 0) };
    }
    // Backward compatibility with old shape where file stored only state
    return { state: parsed || {}, updatedAt: 0 };
  } catch (error) {
    return { state: {}, updatedAt: 0 };
  }
}

function writeState(payload) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', (_req, res) => {
  const payload = readState();
  res.json(payload);
});

app.post('/api/state', (req, res) => {
  const state = req.body?.state;
  const updatedAt = Number(req.body?.updatedAt || 0);
  if (!state || typeof state !== 'object') {
    return res.status(400).json({ error: 'Invalid state payload.' });
  }
  const existing = readState();
  if (updatedAt >= Number(existing.updatedAt || 0)) {
    writeState({ state, updatedAt });
    return res.json({ ok: true, savedAt: new Date(updatedAt || Date.now()).toISOString() });
  }
  return res.json({
    ok: false,
    ignored: true,
    reason: 'Incoming state is older than stored state.'
  });
});

app.get('/', (_req, res) => {
  res.sendFile(APP_FILE);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`NTE app running at http://localhost:${PORT}`);
});
