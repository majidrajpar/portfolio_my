@echo off
echo ==========================================
echo Portfolio Website - GitHub Setup
echo ==========================================
echo.
echo This script will help you push your portfolio to GitHub
echo.
echo FIRST: Make sure you've created the repository on GitHub!
echo   Go to: https://github.com/new
echo   Name: portfolio_my
echo   Visibility: Public
echo.
set /p username="Enter your GitHub username: "

echo.
echo Setting up remote repository...
git remote add origin https://github.com/%username%/portfolio_my.git

echo.
echo Verifying remote configuration...
git remote -v

echo.
echo Pushing your code to GitHub...
git push -u origin main

echo.
echo ==========================================
echo DONE! Your code is now on GitHub
echo ==========================================
echo.
echo Next steps:
echo 1. Go to: https://github.com/%username%/portfolio_my/settings/pages
echo 2. Under "Source", select "GitHub Actions"
echo 3. Wait 1-2 minutes for deployment
echo 4. Visit: https://%username%.github.io/portfolio_my/
echo.
pause
