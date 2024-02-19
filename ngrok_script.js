// ngrok_script.js

const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');
const ngrok = require('@ngrok/ngrok');

// Set ngrok authentication token from environment variable
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

// Function to download and extract ngrok
function downloadNgrok() {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream('ngrok.zip');
        https.get('https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-stable-linux-amd64.zip', (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                fs.createReadStream('ngrok.zip').pipe(unzipper.Extract({ path: '.' })).on('close', () => {
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
    try {
        await ngrok.authtoken(NGROK_AUTH_TOKEN);
    } catch (err) {
        throw err;
    }
}

// Function to enable Remote Desktop
async function enableRemoteDesktop() {
    try {
        // Add your code to enable Remote Desktop here
    } catch (err) {
        throw err;
    }
}

// Function to create ngrok tunnel
async function createNgrokTunnel() {
    try {
        await ngrok.tcp(3389);
    } catch (err) {
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
        console.error(error);
    }
}

main();
