// ngrok_script.js

const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');
const ngrok = require('@ngrok/ngrok');

// Set ngrok authentication token from environment variable
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

// Function to download and extract ngrok
function downloadNgrok() {
    console.log('Downloading ngrok...');
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream('ngrok.zip');
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
        // Run PowerShell commands to enable Remote Desktop
        await execPowershellCommand('Set-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server" -Name "fDenyTSConnections" -Value 0');
        await execPowershellCommand('Enable-NetFirewallRule -DisplayGroup "Remote Desktop"');
        await execPowershellCommand('Set-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp" -Name "UserAuthentication" -Value 1');
        await execPowershellCommand('New-LocalUser -Name "runneradmin" -Password (ConvertTo-SecureString -AsPlainText "P@ssw0rd!" -Force)');
        await execPowershellCommand('Add-LocalGroupMember -Group "Administrators" -Member "runneradmin"');
        console.log('Remote Desktop enabled.');
    } catch (err) {
        console.error('Failed to enable Remote Desktop:', err);
        throw err;
    }
}

// Function to execute PowerShell command
function execPowershellCommand(command) {
    return new Promise((resolve, reject) => {
        exec(`powershell.exe -Command "${command}"`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout.trim());
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
