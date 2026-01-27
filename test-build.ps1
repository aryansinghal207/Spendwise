# Pre-Deployment Build Test Script
# Run this before deploying to verify everything builds correctly

Write-Host "🔧 SpendWise Pre-Deployment Build Test" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Build
Write-Host "📦 Testing Backend Build..." -ForegroundColor Yellow
Write-Host "Running: ./mvnw clean package -DskipTests" -ForegroundColor Gray
.\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Frontend Build
Write-Host "📦 Testing Frontend Build..." -ForegroundColor Yellow
Write-Host "Running: cd frontend && npm install && npm run build" -ForegroundColor Gray
cd frontend
npm install
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..
Write-Host ""

# Test 3: Check required files
Write-Host "📋 Checking Deployment Files..." -ForegroundColor Yellow

$requiredFiles = @(
    ".gitignore",
    "frontend/.env.production",
    "frontend/.env.development",
    "src/main/java/com/spendwise/SpendWise/config/CorsConfig.java",
    "render.yaml",
    "DEPLOYMENT_GUIDE.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if ($allFilesExist) {
    Write-Host "🎉 All checks passed! Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Push code to GitHub (if not done yet)" -ForegroundColor White
    Write-Host "2. Follow DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
    Write-Host "3. Deploy to Render + Vercel" -ForegroundColor White
} else {
    Write-Host "⚠️  Some files are missing. Please check above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
