const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');
const ngrok = require('@ngrok/ngrok');
const { exec } = require('child_process');

// Set ngrok authentication token from environment variable
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

// Function to download and extract ngrok
async function downloadNgrok() {
    console.log('Downloading ngrok...');
    const file = fs.createWriteStream('ngrok.zip');
    await new Promise((resolve, reject) => {
        https.get('https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-stable-linux-amd64.zip', (response) => {
            response.pipe(file);
            file.on('finish', () => {
                console.log('Download complete.');
                file.close();
                fs.createReadStream('ngrok.zip').pipe(unzipper.Extract({ path: '.' })).on('close', () => {
                    console.log('Extraction complete.');
                    fs.unlinkSync('ngrok.zip');
                    resolve();
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to authenticate ngrok
async function authenticateNgrok() {
    console.log('Authenticating ngrok...');
    try {
        await ngrok.authtoken(NGROK_AUTH_TOKEN);
        console.log('Authentication successful.');
    } catch (err) {
        console.error('Authentication failed:', err);
        throw err;
    }
}

// Function to enable Remote Desktop
async function enableRemoteDesktop() {
    console.log('Enabling Remote Desktop...');
    try {
        // Linux commands to enable Remote Desktop
        await execCommand('sudo sed -i "s/Port 22/Port 3389/" /etc/ssh/sshd_config');
        await execCommand('sudo service sshd restart');
        console.log('Remote Desktop enabled.');
    } catch (err) {
        console.error('Failed to enable Remote Desktop:', err);
        throw err;
    }
}

// Function to execute shell command
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Function to create ngrok tunnel
async function createNgrokTunnel() {
    console.log('Creating ngrok tunnel...');
    try {
        await ngrok.connect({
            proto: 'tcp',
            addr: 3389
        });
        console.log('Ngrok tunnel created.');
    } catch (err) {
        console.error('Failed to create ngrok tunnel:', err);
        throw err;
    }
}

// Main function to execute the script
async function main() {
    try {
        await downloadNgrok();
        await authenticateNgrok();
        await enableRemoteDesktop();
        await createNgrokTunnel();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
