# Kobo Annotations Export

A simplified Python tool to export highlights and notes from a Kobo eReader database (`KoboReader.sqlite`) into beautifully formatted Markdown files, organized by Author and Book.

## Features

- **Automatic Extraction**: Reads the Kobo SQLite database and extracts all highlights and notes.
- **Smart Organization**: Creates a folder structure `Annotations/<Author>/<Book>.md`.
- **Visual Highlights**: Preserves the highlight colors (Green, Blue, Pink, Yellow) using HTML styling within the Markdown.
- **Metadata**: Includes timestamps and annotation types.
- **Cross-Platform**: Works on Windows, Mac, and Linux.

## How to Use

### Using the Executable (Windows)

1. Connect your Kobo eReader to your computer.
2. Locate the `KoboReader.sqlite` file in the `.kobo` folder of your device.
3. Place `KoboExport.exe` in the same folder as `KoboReader.sqlite` (or copy the database to a folder on your computer).
4. Run `KoboExport.exe`.
5. A new folder named `Annotations` will be created containing your exports.

### Running from Source

Requirements: Python 3+

1. Clone this repository.
2. Place your `KoboReader.sqlite` file in the project directory.
3. Run the script:
   ```bash
   python export_annotations.py
   ```

## Building the Executable

To create a standalone executable for your operating system:

1. Install PyInstaller:
   ```bash
   pip install pyinstaller
   ```
2. Run the build command:
   ```bash
   pyinstaller --onefile --name KoboExport export_annotations.py
   ```
   *Or use the provided `build_executable.bat` on Windows.*

## Output Format

The generated Markdown files use HTML blockquotes to visually represent the highlight colors used on the Kobo device:

- **Green**
- **Blue**
- **Pink**
- **Yellow**

Notes added to highlights are preserved and displayed below the text.
