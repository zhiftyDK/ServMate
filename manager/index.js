// index.js
const express = require('express');
const path = require('path');
const manager = require('./modules/manager');
const authRoutes = require('./modules/auth');
const { authenticateToken } = require('./modules/auth');

const HTTP_PORT = 3000;

manager.startManager({ verbose: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Auth routes
app.use('/api', authRoutes);

// API: Protected route (GET /api/agents requires valid token)
app.get('/api/agents', authenticateToken, (req, res) => {
  res.json(manager.getAgents());
});

app.listen(HTTP_PORT, () => {
  console.log(`🌐 Web UI + API server running at http://localhost:${HTTP_PORT}`);
});
