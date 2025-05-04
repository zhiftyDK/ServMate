const express = require('express');
const WebSocket = require('ws');
const SSHClient = require('ssh2').Client;

const router = express.Router();
const wss = new WebSocket.Server({ noServer: true });

const SSH_CONFIG = {
    host: '192.168.1.242',
    port: 22,
    username: 'pi',
    password: 'rzp53qpw', // Or use a private key for auth
};

// WebSocket connection handling
wss.on('connection', (ws) => {
    const ssh = new SSHClient();

    ssh.on('ready', () => {
        ssh.shell((err, stream) => {
            if (err) {
                ws.send('SSH connection failed: ' + err);
                return;
            }

            // Forward data between WebSocket and SSH stream
            stream.on('data', (data) => {
                ws.send(data.toString());
            });

            ws.on('message', (message) => {
                stream.write(message);
            });

            ws.on('close', () => {
                ssh.end();
            });
        });
    }).on('error', (err) => {
        ws.send('SSH Error: ' + err.message);
        ws.close();
    }).connect(SSH_CONFIG);
});

// Serve frontend assets (static files like HTML, JS)
router.use(express.static('public'));

// Export the router to be used in the main app
module.exports = { router, wss };