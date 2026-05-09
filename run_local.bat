@echo off
echo ==============================================
echo 🚀 Starting Nexus EDU Frontend (Local Mode)...
echo ==============================================
cd "C:\Users\hassa\Desktop\anti\million-platform\apps\web"

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak > NUL

echo 🌐 Opening Browser...
start http://localhost:3000

echo ⚙️ Starting Next.js...
npm run dev

pause
