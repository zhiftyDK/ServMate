// index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const manager = require('./modules/manager');
const sshclient = require("./modules/sshclient"); // Import the sshclient module
const authRoutes = require('./modules/auth');
const { authenticateToken } = require('./modules/auth');
const http = require('http'); // Import the http module

const HTTP_PORT = 4500;

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

manager.startManager({ verbose: true });

const app = express();
const server = http.createServer(app); // Create the server instance to pass to WebSocket

// Use WebSocket server from sshclient.js
server.on('upgrade', (request, socket, head) => {
    sshclient.wss.handleUpgrade(request, socket, head, (ws) => {
        sshclient.wss.emit('connection', ws, request); // Pass the WebSocket connection to the handler
    });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', authRoutes);

app.get('/api/agents', authenticateToken, (req, res) => {
    res.json(manager.getAgents());
});

app.post('/api/configure-agent', authenticateToken, (req, res) => {
    const { agentid, custom_name, ssh_username, ssh_password } = req.body;

    if (!agentid || !custom_name) {
        return res.status(400).json({ message: "Missing agentid or custom_name in the request body." });
    }

    try {
        manager.configureAgent(agentid, custom_name, ssh_username, ssh_password);
        res.status(200).json({ message: `Agent ${agentid} configured successfully with name: ${custom_name}` });
    } catch (err) {
        console.error('Error configuring agent:', err);
        res.status(500).json({ message: 'An error occurred while configuring the agent.' });
    }
});

app.post('/api/unconfigure-agent', authenticateToken, (req, res) => {
    const { agentid } = req.body;

    if (!agentid) {
        return res.status(400).json({ message: "Missing agentid in the request body." });
    }

    try {
        manager.unconfigureAgent(agentid);
        res.status(200).json({ message: `Agent ${agentid} unconfigured successfully.` });
    } catch (err) {
        console.error('Error unconfiguring agent:', err);
        res.status(500).json({ message: 'An error occurred while unconfiguring the agent.' });
    }
});

// Start the HTTP server and the WebSocket server
server.listen(HTTP_PORT, () => {
    console.log(`🌐 Web UI + API server running at http://localhost:${HTTP_PORT}`);
});
