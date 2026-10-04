@echo off
REM Start the local helper app for testing.
REM This is meant to be run from the extracted mod package during local prototyping.

setlocal
cd /d "%~dp0..\HelperApp\proxy-app"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 18+ first.
  pause
  exit /b 1
)

echo Starting ARK Proxy Helper...
start "ARK Proxy Helper" cmd /c node server.js

echo Helper app started.
echo Web UI: http://localhost:8080
pause
