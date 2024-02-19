# ngrok_script.ps1

# Set ngrok authentication token from environment variable
$NGROK_AUTH_TOKEN = $env:NGROK_AUTH_TOKEN

# Download ngrok executable
Invoke-WebRequest https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip -OutFile ngrok.zip

# Extract ngrok executable
Expand-Archive ngrok.zip

# Authenticate ngrok
.\ngrok\ngrok.exe authtoken $NGROK_AUTH_TOKEN

# Enable Remote Desktop
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server' -Name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "UserAuthentication" -Value 1
New-LocalUser -Name "runneradmin" -Password (ConvertTo-SecureString -AsPlainText "P@ssw0rd!" -Force)

# Create ngrok tunnel
.\ngrok\ngrok.exe tcp 3389
