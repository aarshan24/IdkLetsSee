const { exec } = require('child_process');
const ngrok = require('ngrok');
const http = require('http');

// Set ngrok authentication token from environment variable
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

// Function to authenticate ngrok
async function authenticateNgrok() {
    try {
        const authToken = await ngrok.authtoken(NGROK_AUTH_TOKEN);
        console.log('ngrok authentication successful');
        return authToken;
    } catch (error) {
        console.error('Error authenticating ngrok:', error);
        throw error;
    }
}

// Function to create ngrok tunnel
async function createNgrokTunnel() {
    try {
        const url = await ngrok.connect({
            proto: 'tcp',
            addr: 3389 // Remote Desktop port
        });
        console.log('ngrok tunnel created:', url);
        return url;
    } catch (error) {
        console.error('Error creating ngrok tunnel:', error);
        throw error;
    }
}

// Start HTTP server
const server = http.createServer(async (req, res) => {
    try {
        // Authenticate ngrok
        await authenticateNgrok();

        // Create ngrok tunnel
        const tunnelUrl = await createNgrokTunnel();

        // Get ngrok tunnel IP address and port
        const urlParts = tunnelUrl.split(':');
        const ipAddress = urlParts[1].slice(2); // Remove slashes
        const port = urlParts[2];

        // Generate username and password
        const username = 'user';
        const password = 'password';

        // Prepare response with connection details
        const connectionDetails = {
            ip: ipAddress,
            port: port,
            username: username,
            password: password
        };

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(connectionDetails));
    } catch (error) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
