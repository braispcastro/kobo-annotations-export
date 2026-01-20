@echo off
echo Installing requirements...
pip install pyinstaller

echo Building executable...
pyinstaller --onefile --name KoboExport export_annotations.py

echo Done! The executable is in the 'dist' folder.
pause
