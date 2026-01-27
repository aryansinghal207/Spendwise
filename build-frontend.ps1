# build-frontend.ps1
# Helper to build the frontend using system Node/npm and then run Maven package.

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node is not installed or not found on PATH. Please install Node.js (LTS) from https://nodejs.org/ and re-run this script."
    exit 1
}

Push-Location -Path "$PSScriptRoot\frontend"

Write-Host "Installing frontend dependencies (npm ci)..."
npm ci
if ($LASTEXITCODE -ne 0) { Write-Error "npm ci failed"; Pop-Location; exit $LASTEXITCODE }

Write-Host "Building frontend (npm run build)..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "npm run build failed"; Pop-Location; exit $LASTEXITCODE }

Pop-Location

Write-Host "Running Maven package (backend + copy static)..."
& "$PSScriptRoot\mvnw.cmd" -DskipTests clean package
if ($LASTEXITCODE -ne 0) { Write-Error "Maven package failed"; exit $LASTEXITCODE }

Write-Host "Build complete. Jar is under target/"