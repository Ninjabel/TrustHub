# Prisma Client Regeneration Script
# Run this script when the dev server is stopped

Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
$devProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node_modules*" }

if ($devProcess) {
    Write-Host "⚠️  Warning: Node processes detected. Please stop the dev server first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To stop the dev server:" -ForegroundColor Yellow
    Write-Host "  1. Press Ctrl+C in the terminal running 'npm run dev'" -ForegroundColor Yellow
    Write-Host "  2. Wait for the process to fully stop" -ForegroundColor Yellow
    Write-Host "  3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Navigate to web directory
Set-Location -Path "apps\web"

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Green
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Prisma client regenerated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now restart the dev server with:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to regenerate Prisma client" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Ensure no Node processes are running" -ForegroundColor Yellow
    Write-Host "  2. Close VS Code and reopen" -ForegroundColor Yellow
    Write-Host "  3. Try running: npx prisma generate" -ForegroundColor Yellow
}

# Return to root directory
Set-Location -Path "..\..\"
