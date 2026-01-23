@echo off
echo Cleaning previous build...
if exist dist rmdir /s /q dist

echo Building Kobo Annotations Site...
bun run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Creating data folder in dist...
    if not exist "dist\data" mkdir "dist\data"
    
    echo Copying deployment files to dist folder...
    if exist "start-server.sh" copy "start-server.sh" "dist\" /Y
    if exist "Dockerfile" copy "Dockerfile" "dist\" /Y
    if exist "package.json" copy "package.json" "dist\" /Y
    if exist "bun.lock" copy "bun.lock" "dist\" /Y
    
    echo.
    echo ==========================================
    echo Build Successful! 
    echo Application generated in 'dist' folder.
    echo Remember to populate 'dist/data' with backups.
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo Build FAILED. Please check errors above.
    echo ==========================================
)

pause
