# SpendWise Startup Script with Google Gemini Integration
# Save this as start-with-gemini.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$GeminiKey
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Starting SpendWise with Gemini AI" -ForegroundColor Cyan
Write-Host "  (FREE - No charges!)" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Set environment variables
$env:DB_URL='jdbc:postgresql://localhost:8000/spendwise_db'
$env:DB_USER='spendwise_user'
$env:DB_PASSWORD='REMOVED_PASSWORD'
$env:GEMINI_API_KEY=$GeminiKey

Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host "✓ Gemini API Key: $($GeminiKey.Substring(0,10))..." -ForegroundColor Green

# Check if PostgreSQL is running
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL is not running!" -ForegroundColor Red
    Write-Host "  Please start PostgreSQL and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nStarting backend server with FREE Gemini AI..." -ForegroundColor Yellow
Write-Host "Backend will start on http://localhost:8080" -ForegroundColor Cyan
Write-Host "Keep this terminal open!`n" -ForegroundColor Yellow

# Start the backend
.\mvnw.cmd spring-boot:run