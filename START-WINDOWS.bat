@echo off
setlocal
cd /d "%~dp0"
title Aurora Travel
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org/en/download and reopen this file.
  pause
  exit /b 1
)
node -e "let v=process.versions.node.split('.').map(Number);if(v[0]<22||(v[0]===22&&v[1]<12))process.exit(1)"
if errorlevel 1 (
  echo Node.js 22.12 or newer is needed. Install the current LTS version.
  pause
  exit /b 1
)
if not exist node_modules (
  echo First-time setup: downloading free project packages. Internet is required.
  call npm.cmd install
  if errorlevel 1 goto fail
)
if not exist dist\index.html if not exist public\hero.mp4 node scripts\fetch-hero.mjs
call npm.cmd run build
if errorlevel 1 goto fail
node server.mjs --open
pause
exit /b 0
:fail
echo.
echo Setup stopped. Check the message above. No payment is required.
pause
exit /b 1
