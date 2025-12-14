# PowerShell script to run cleanup on server
$serverIP = "23.88.113.154"
$username = "root"
$password = "FlightSchedule2024!"

# Create SSH command
$sshCommand = @"
cd /opt/victoriaocara && 
chmod +x clean-site-nou-text.sh && 
./clean-site-nou-text.sh
"@

Write-Host "Connecting to server to clean 'site nou' text..."
Write-Host "Server: $serverIP"
Write-Host "Running cleanup script..."

# Note: This requires SSH client or you can use PuTTY/plink
# For Windows, you might need to install OpenSSH or use WSL
Write-Host ""
Write-Host "Please run this command manually on your server:"
Write-Host "ssh root@$serverIP"
Write-Host "cd /opt/victoriaocara"
Write-Host "chmod +x clean-site-nou-text.sh"
Write-Host "./clean-site-nou-text.sh"