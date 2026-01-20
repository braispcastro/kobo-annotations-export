@echo off
echo Cleaning previous build...
if exist dist rmdir /s /q dist

echo Building Kobo Annotations Site...
bun run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo Build Successful! 
    echo Website generated in 'dist' folder.
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo Build FAILED. Please check errors above.
    echo ==========================================
)

pause
