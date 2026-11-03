@echo off
set "PATH=C:\Users\daivi\AppData\Local\Programs\MinGit\cmd;C:\Users\daivi\AppData\Local\Programs\MinGit\ucrt64\bin;%PATH%"
cd /d "C:\Users\daivi\.gemini\antigravity\scratch\hotel-management-system"
echo =======================================================
echo Pushing Hotel Management System to GitHub
echo Repo: https://github.com/daivicmurali/hotel-management-system.git
echo =======================================================
git status
echo.
echo Pushing main branch to origin...
git push -u origin main
echo.
pause
