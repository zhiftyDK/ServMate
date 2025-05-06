const express = require('express');
const WebSocket = require('ws');
const SSHClient = require('ssh2').Client;

const router = express.Router();
const wss = new WebSocket.Server({ noServer: true });

// WebSocket connection handling
wss.on('connection', (ws) => {
    let ssh = null;
    let stream = null;
    let isSSHConnected = false;

    ws.on('message', (message) => {
        // If SSH not yet connected, treat first message as SSH_CONFIG
        if (!isSSHConnected) {
            let SSH_CONFIG;
            try {
                SSH_CONFIG = JSON.parse(message);
                if (!SSH_CONFIG.host || !SSH_CONFIG.username || (!SSH_CONFIG.password && !SSH_CONFIG.privateKey)) {
                    ws.send('Invalid SSH config: Missing required fields.');
                    ws.close();
                    return;
                }
            } catch (err) {
                ws.send('Invalid SSH config format.');
                ws.close();
                return;
            }

            ssh = new SSHClient();

            ssh.on('ready', () => {
                isSSHConnected = true;
                ssh.shell((err, sshStream) => {
                    if (err) {
                        ws.send('SSH connection failed: ' + err.message);
                        ws.close();
                        return;
                    }

                    stream = sshStream;

                    // Forward SSH output to WebSocket
                    stream.on('data', (data) => {
                        ws.send(data.toString());
                    });

                    stream.on('close', () => {
                        ws.close();
                    });

                });
            }).on('error', (err) => {
                ws.send('SSH Error: ' + err.message);
                ws.close();
            }).connect(SSH_CONFIG);

        } else {
            // Once SSH is ready, treat all messages as terminal input
            if (stream) {
                stream.write(message);
            }
        }
    });

    ws.on('close', () => {
        if (ssh) ssh.end();
    });
});

// Serve frontend assets (static files like HTML, JS)
router.use(express.static('public'));

// Export the router and websocket server
module.exports = { router, wss };
