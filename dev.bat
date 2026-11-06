@echo off
echo ========================================================
echo   WeatherGPT (SIH26068) - Full-Stack Development Server
echo ========================================================
echo.

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "WeatherGPT Backend" cmd /k "backend\.venv\Scripts\python.exe backend\run.py"

timeout /t 2 /nobreak > nul

echo Starting Next.js Frontend on http://localhost:3000 ...
start "WeatherGPT Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo ========================================================
echo Services started!
echo - Frontend: http://localhost:3000
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================

