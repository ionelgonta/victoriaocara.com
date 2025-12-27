# PowerShell script to fix upload limits
Write-Host "🔧 Upload limits have been updated in the code!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 New limits configured:" -ForegroundColor Cyan
Write-Host "   • Nginx: 10MB (client_max_body_size)" -ForegroundColor White
Write-Host "   • API routes: 10MB" -ForegroundColor White
Write-Host "   • Frontend validation: 10MB" -ForegroundColor White
Write-Host "   • Axios timeout: 60 seconds" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy the updated code to your server" -ForegroundColor White
Write-Host "2. Update nginx config on server with the new nginx-multi-domain-config.txt" -ForegroundColor White
Write-Host "3. Reload nginx: sudo systemctl reload nginx" -ForegroundColor White
Write-Host ""
Write-Host "This should fix the 413 Request Entity Too Large errors!" -ForegroundColor Green