@echo off
echo Starting Helmet & Plate Detection Web App...
echo Please wait for the server to initialize (models loading)...
echo Once ready, open your browser to http://localhost:5000
start "" "http://localhost:5000"
python app.py
pause
