// ngrok_script.js

const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');

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
function authenticateNgrok() {
    return new Promise((resolve, reject) => {
        exec(`./ngrok authtoken ${NGROK_AUTH_TOKEN}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Function to enable Remote Desktop
function enableRemoteDesktop() {
    return new Promise((resolve, reject) => {
        exec('reg add "HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                exec('netsh advfirewall firewall set rule group="Remote Desktop" new enable=yes', (err, stdout, stderr) => {
                    if (err) {
                        reject(err);
                    } else {
                        exec('reg add "HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
                            if (err) {
                                reject(err);
                            } else {
                                exec('net user runneradmin P@ssw0rd! /add', (err, stdout, stderr) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        exec('net localgroup Administrators runneradmin /add', (err, stdout, stderr) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

// Function to create ngrok tunnel
function createNgrokTunnel() {
    exec('./ngrok tcp 3389', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
        }
        console.log(stdout);
    });
}

// Main function to execute the script
async function main() {
    try {
        await downloadNgrok();
        await authenticateNgrok();
        await enableRemoteDesktop();
        createNgrokTunnel();
    } catch (error) {
        console.error(error);
    }
}

main();
