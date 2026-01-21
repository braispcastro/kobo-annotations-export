@echo off
echo Cleaning previous build...
if exist dist rmdir /s /q dist

echo Building Kobo Annotations Site...
bun run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Copying markup images to dist folder...
    if exist "data\markups" xcopy "data\markups" "dist\markups\" /E /I /H /Y
    
    echo Copying deployment script to dist folder...
    if exist "start-server.sh" copy "start-server.sh" "dist\" /Y
    
    echo.
    echo ==========================================
    echo Build Successful! 
    echo Website and markups generated in 'dist' folder.
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo Build FAILED. Please check errors above.
    echo ==========================================
)

pause
