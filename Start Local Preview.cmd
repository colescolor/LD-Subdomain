@echo off
cd /d "%~dp0"
if not exist "node_modules\three\package.json" (
  call npm install --ignore-scripts --no-audit --no-fund
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://127.0.0.1:4173 after the server starts.
echo This runs in the foreground. Press Ctrl+C to stop.
call npm run dev
if errorlevel 1 pause
