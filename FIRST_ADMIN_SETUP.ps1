# First Admin Setup Script for Sociogram
# This script helps you promote yourself to admin using Prisma Studio

Write-Host "`n🔓 Sociogram - First Admin Setup`n" -ForegroundColor Cyan
Write-Host "This script will help you break the admin approval loop.`n" -ForegroundColor Yellow

Write-Host "📋 Instructions:`n" -ForegroundColor Green
Write-Host "1. Make sure your backend is running (npm start in backend folder)" -ForegroundColor White
Write-Host "2. This script will open Prisma Studio for you" -ForegroundColor White
Write-Host "3. Follow the on-screen instructions in Prisma Studio`n" -ForegroundColor White

$continue = Read-Host "Ready to open Prisma Studio? (Y/N)"

if ($continue -eq 'Y' -or $continue -eq 'y') {
    Write-Host "`n🌐 Opening Prisma Studio...`n" -ForegroundColor Green
    
    # Check if we're in the right directory
    if (Test-Path "backend\prisma\schema.prisma") {
        Write-Host "✅ Found Prisma schema" -ForegroundColor Green
        Write-Host "`n📝 Steps to follow:`n" -ForegroundColor Yellow
        
        Write-Host "1. In Prisma Studio (will open in browser):" -ForegroundColor Cyan
        Write-Host "   - Click 'User' table in left sidebar" -ForegroundColor White
        Write-Host "   - Find your user (by email or username)" -ForegroundColor White
        Write-Host "   - Click on your user row" -ForegroundColor White
        Write-Host "   - Click 'Edit' button`n" -ForegroundColor White
        
        Write-Host "2. Change these fields:" -ForegroundColor Cyan
        Write-Host "   - role: Change to 'SUPER_ADMIN'" -ForegroundColor White
        Write-Host "   - profileStatus: Change to 'APPROVED'" -ForegroundColor White
        Write-Host "   - Click 'Save 1 change'`n" -ForegroundColor White
        
        Write-Host "3. Close Prisma Studio (Ctrl+C in terminal)" -ForegroundColor Cyan
        Write-Host "4. Refresh your browser (Ctrl+Shift+R)`n" -ForegroundColor Cyan
        
        Write-Host "🚀 Starting Prisma Studio...`n" -ForegroundColor Green
        Write-Host "⏳ Wait for browser to open, then follow steps above...`n" -ForegroundColor Yellow
        
        # Change to backend directory and run Prisma Studio
        Set-Location backend
        npx prisma studio
        Set-Location ..
        
    } else {
        Write-Host "`n❌ Error: Cannot find Prisma schema!" -ForegroundColor Red
        Write-Host "Make sure you're running this script from the Sociogram root directory.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Cancelled. Run this script again when ready.`n" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



