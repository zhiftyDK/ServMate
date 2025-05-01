// manager.js (MODULE version)
const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const PORT = 5005;
const AGENTS_FILE = path.join(__dirname, 'agents.json');
const OFFLINE_TIMEOUT = 15000; // 15 sec

let agents = {};
let socket = null;

// Load existing agents from disk
function loadAgents() {
    if (fs.existsSync(AGENTS_FILE)) {
        agents = JSON.parse(fs.readFileSync(AGENTS_FILE));
    }
}

// Save static agent info to disk
function saveAgents() {
    const toSave = {};
    for (const id in agents) {
        const agent = agents[id];
        toSave[id] = {
        hostname: agent.hostname,
        ip: agent.ip,
        cpu_model: agent.cpu_model,
        cpu_cores: agent.cpu_cores,
        total_mem: agent.total_mem,
        disk_info: agent.disk_info,
        gpu_model: agent.gpu_model
        };
    }
    fs.writeFileSync(AGENTS_FILE, JSON.stringify(toSave, null, 2));
}

// Public function to get current agents list (with ONLINE/OFFLINE status)
function getAgents() {
    const now = Date.now();
    const result = {};
    for (const id in agents) {
        const agent = agents[id];
        const lastSeen = now - agent.last_seen;
        const isOnline = lastSeen < OFFLINE_TIMEOUT;

        result[id] = {
        ...agent,
        status: isOnline ? 'online' : 'offline',
        last_seen_secs: Math.floor(lastSeen / 1000)
        };
    }
    return result;
}

// Start the UDP discovery listener
function startManager(options = {}) {
    const verbose = options.verbose ?? false;

    if (socket) {
        if (verbose) console.log('🔄 Manager already running.');
        return; // already running
    }

    socket = dgram.createSocket('udp4');

    socket.on('message', (msg, rinfo) => {
        try {
            const data = JSON.parse(msg);
            const agentId = `${data.hostname}:${data.ip}`;

            if (!agents[agentId] && verbose) {
                console.log(`✅ Agent online: ${agentId}`);
            }

            agents[agentId] = {
                ...agents[agentId],
                ...data,
                last_seen: Date.now()
            };

            saveAgents();
        } catch (err) {
            if (verbose) console.error('Error parsing agent message:', err);
        }
    });

    socket.bind(PORT, () => {
        if (verbose) console.log(`✅ Manager listening on UDP ${PORT}`);
        loadAgents();
    });
}

// Export public API
module.exports = {
    startManager,
    getAgents
};
