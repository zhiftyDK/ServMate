// index.js
const express = require('express');
const path = require('path');
const manager = require('./modules/manager');
const authRoutes = require('./modules/auth');
const { authenticateToken } = require('./modules/auth');

const HTTP_PORT = 4500;

manager.startManager({ verbose: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Auth routes
app.use('/api', authRoutes);

app.get('/api/agents', authenticateToken, (req, res) => {
    res.json(manager.getAgents());
});

app.post('/api/configure-agent', authenticateToken, (req, res) => {
    const { agentid, custom_name } = req.body;

    if (!agentid || !custom_name) {
        return res.status(400).json({ message: "Missing agentid or custom_name in the request body." });
    }

    try {
        manager.configureAgent(agentid, custom_name );
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

app.listen(HTTP_PORT, () => {
    console.log(`🌐 Web UI + API server running at http://localhost:${HTTP_PORT}`);
});
