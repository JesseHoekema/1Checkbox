const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html')); // Adjust path for Vercel
});

// Track the checkbox state (default: unchecked)
let isChecked = false;

// WebSocket logic
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ isChecked }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.hasOwnProperty('isChecked')) {
      isChecked = data.isChecked;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ isChecked }));
        }
      });
    }
  });
});

// Export the server as Vercel expects it
module.exports = server;
