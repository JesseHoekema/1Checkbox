const WebSocket = require('ws');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const server = res.socket.server;

    if (!server.wss) {
      const wss = new WebSocket.Server({
        noServer: true,
      });

      wss.on('connection', (ws) => {
        let isChecked = false; // Track checkbox state

        ws.send(JSON.stringify({ isChecked }));

        ws.on('message', (message) => {
          const data = JSON.parse(message);
          if (data.hasOwnProperty('isChecked')) {
            isChecked = data.isChecked;
            // Send the updated state to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ isChecked }));
              }
            });
          }
        });
      });

      server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      });

      server.wss = wss; // Attach WebSocket server to the HTTP server
    }

    res.status(200).send('WebSocket Server is running');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
