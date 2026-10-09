@echo off
rem Starts ESAT Practice on http://localhost:8765 and opens it in your browser.
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py serve.py
  goto end
)
where python >nul 2>nul
if not errorlevel 1 (
  python serve.py
  goto end
)
echo Python isn't installed. Get it from https://www.python.org/downloads/ (tick "Add python.exe to PATH"),
echo or simply double-click index.html to use the app without the local server.
:end
pause
