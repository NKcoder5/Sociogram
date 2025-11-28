# Quick Logout Script for Sociogram
# This script helps you logout from the current user

Write-Host "`n🔐 Sociogram Logout Helper`n" -ForegroundColor Cyan

Write-Host "Choose a method:`n" -ForegroundColor Yellow
Write-Host "1. Open browser console commands (Easiest)" -ForegroundColor White
Write-Host "2. Show manual steps" -ForegroundColor White
Write-Host "3. Open browser to app URL" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n📋 Copy these commands to browser console (F12 -> Console tab):`n" -ForegroundColor Green
        Write-Host "localStorage.removeItem('token');" -ForegroundColor Cyan
        Write-Host "localStorage.removeItem('user');" -ForegroundColor Cyan
        Write-Host "window.location.reload();" -ForegroundColor Cyan
        Write-Host "`n✅ Then press Enter in the browser console`n" -ForegroundColor Green
        
        # Open browser
        Start-Process "http://localhost:5000"
        Write-Host "🌐 Browser opened. Press F12 and paste the commands above.`n" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`n📝 Manual Logout Steps:`n" -ForegroundColor Green
        Write-Host "1. Open browser and go to: http://localhost:5000" -ForegroundColor White
        Write-Host "2. Press F12 to open Developer Tools" -ForegroundColor White
        Write-Host "3. Click on 'Console' tab" -ForegroundColor White
        Write-Host "4. Type or paste: localStorage.clear()" -ForegroundColor White
        Write-Host "5. Press Enter" -ForegroundColor White
        Write-Host "6. Type: window.location.reload()" -ForegroundColor White
        Write-Host "7. Press Enter`n" -ForegroundColor White
        Write-Host "✅ You're logged out!`n" -ForegroundColor Green
        
        Start-Process "http://localhost:5000"
    }
    "3" {
        Write-Host "`n🌐 Opening browser...`n" -ForegroundColor Green
        Start-Process "http://localhost:5000"
        Write-Host "✅ Browser opened. Press F12 and run: localStorage.clear(); window.location.reload();`n" -ForegroundColor Green
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again and choose 1-3.`n" -ForegroundColor Red
    }
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

