@echo off
set msg=%~1
if "%msg%"=="" set msg=Update code

echo ========================================
echo Adding files to Git...
echo ========================================
git add .

echo.
echo ========================================
echo Committing changes with message: %msg%
echo ========================================
git commit -m "%msg%"

echo.
echo ========================================
echo Pushing to Github...
echo ========================================
git push

echo.
echo ========================================
echo Push Completed Successfully!
echo ========================================
pause
