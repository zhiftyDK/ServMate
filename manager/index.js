// index.js
const express = require('express');
const path = require('path');
const manager = require('./manager');

const HTTP_PORT = 3000;

manager.startManager({ verbose: true });  // Start discovery

const app = express();

// Optional: serve a static frontend UI
app.use(express.static(path.join(__dirname, 'public')));

// API route to get agents
app.get('/api/agents', (req, res) => {
  res.json(manager.getAgents());
});

app.listen(HTTP_PORT, () => {
  console.log(`🌐 Web UI + API server running at http://localhost:${HTTP_PORT}`);
});
