const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Initialize the Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (frontend)
app.use(express.static('public'));

// Track the checkbox state (default: unchecked)
let isChecked = false;

// WebSocket connection logic
wss.on('connection', (ws) => {
  // Send the current checkbox state to the newly connected client
  ws.send(JSON.stringify({ isChecked }));

  // Handle message from client
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.hasOwnProperty('isChecked')) {
      isChecked = data.isChecked;
      // Broadcast the new checkbox state to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ isChecked }));
        }
      });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
