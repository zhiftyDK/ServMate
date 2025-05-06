// agent.js
const dgram = require('dgram');
const os = require('os');
const si = require('systeminformation');

const AGENT_BROADCAST_INTERVAL = 3000; // 3 seconds
const BROADCAST_PORT = 50000;
const BROADCAST_ADDRESS = '255.255.255.255';

async function gatherStaticInfo() {
    const disks = await si.fsSize();
    const filteredDisks = disks.map(disk => ({
        fs: disk.fs,
        used: disk.used,
        size: disk.size
    }));

    const network = await si.networkInterfaces();
    const primaryInterface = network.find(n => n.ip4 && !n.internal);

    const graphics = await si.graphics();
    const gpu = graphics.controllers && graphics.controllers.length > 0
        ? graphics.controllers[0].model.trim()
        : 'Unknown GPU';

    const staticInfo = {
        hostname: os.hostname(),
        ip: primaryInterface ? primaryInterface.ip4 : 'unknown',
        cpu_model: os.cpus()[0].model.trim(),
        cpu_cores: os.cpus().length,
        total_mem: os.totalmem(),
        disk_info: filteredDisks,
        gpu_model: gpu
    };

    console.log('🛠️ Static Info:', staticInfo);
    return staticInfo;
}

async function gatherDynamicInfo() {
    const load = await si.currentLoad();
    return {
        cpu_load: load.currentLoad.toFixed(1),
        used_mem: os.totalmem() - os.freemem(),
        uptime: Math.floor(os.uptime())
    };
}

async function startAgent() {
    const socket = dgram.createSocket('udp4');
    socket.bind(() => {
        socket.setBroadcast(true);
    });

    const staticInfo = await gatherStaticInfo();

    setInterval(async () => {
        const dynamicInfo = await gatherDynamicInfo();
        const payload = {
        ...staticInfo,
        ...dynamicInfo
        };

        const message = Buffer.from(JSON.stringify(payload));
        socket.send(message, 0, message.length, BROADCAST_PORT, BROADCAST_ADDRESS, err => {
        if (err) console.error('Failed to send broadcast:', err);
        });

        console.log('📡 Broadcasting:', payload);
    }, AGENT_BROADCAST_INTERVAL);

    console.log(`✅ Agent broadcasting on UDP ${BROADCAST_PORT} every ${AGENT_BROADCAST_INTERVAL / 1000}s`);
}

startAgent().catch(console.error);
