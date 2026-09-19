@echo off
setlocal
cd /d "%~dp0"

if not exist "API\Uploads" mkdir "API\Uploads"

if not exist "UI\node_modules" (
    echo Installing UI dependencies...
    call npm install --prefix UI
)

echo Starting API at http://localhost:5100 ...
start "BusinessPortal API" cmd /k "dotnet run --project API"

echo Starting UI at http://localhost:5173 ...
start "BusinessPortal UI" cmd /k "npm run dev --prefix UI"

echo.
echo Both servers are starting. Close their windows to stop them.
timeout /t 3 >nul
endlocal