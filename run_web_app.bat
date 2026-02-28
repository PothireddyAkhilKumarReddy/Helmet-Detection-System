@echo off
echo Starting Traffic AI Guard (React SPA + Flask API)
echo ...

:: Start the Python Backend API in a new window
start "Flask Backend" cmd /k "cd backend && python app.py"

:: Start the React UI in another new window
start "React UI" cmd /k "cd frontend && npm run dev"

echo Both services are starting...
echo Please ensure your browser opens to http://localhost:5173
pause
