# 📚 Kobo Annotations Viewer

![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white) ![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?style=flat&logo=astro&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white) ![Antigravity](https://img.shields.io/badge/Made%20with-Antigravity-9cf.svg) ![Vibe Coding](https://img.shields.io/badge/Vibe-Coding-FF69B4)

> A modern, local web viewer for your Kobo eReader annotations, capable of reading directly from the database without intermediate exports.

This project allows you to visualize your highlights and notes in a **premium interface** that respects the original context. It's built for speed and aesthetics.

---

## ✨ Key Features

- **⚡ Zero Export**: Reads directly from `KoboReader.sqlite`. No CSV/JSON export steps needed.
- **📊 Detailed Metadata**: Displays annotation type, chapter progress with visual bars, and localized timestamps.
- **🎨 Visual Fidelity**: Accurately renders Kobo highlight colors (**Green**, **Blue**, **Pink**, **Yellow**).
- **✍️ Handwritten Markups**: Specialized support for Kobo Libra Colour handwritten annotations (SVG overlays over page screenshots).
- **🌗 Theme Switcher**: Includes a persistent **Light/Dark** mode toggle.
- **💎 Premium UI**: Glassmorphism cards, Inter typography, and responsive grid layout.
- **🚀 High Performance**: Powered by Bun's native SQLite driver and Astro's static generation.

## 🛠️ Tech Stack

This project is built with a modern, performance-first stack:

| Technology | Role | Why? |
| :--- | :--- | :--- |
| **[Astro](https://astro.build/)** | Web Framework | Generates ultra-fast static HTML/CSS. |
| **[Bun](https://bun.sh/)** | Runtime & Package Manager | Instant startup and native SQLite support (`bun:sqlite`). |
| **[TypeScript](https://www.typescriptlang.org/)** | Language | Type safety for reliable database queries. |
| **[CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)** | Styling | flexible theming without heavy libraries like Tailwind. |

## 🚀 Quick Start

### Prerequisites
- **[Bun](https://bun.sh/)** installed on your machine.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/braispcastro/kobo-annotations-export.git
    cd kobo-annotations-export
    ```

2.  **Setup the `data` folder**:
    The project expects your personal files inside a `data/` folder at the root (this folder is ignored by Git to keep your data private). Create it and copy:
    -   `KoboReader.sqlite`: Found in the `.kobo/` folder of your device.
    -   `markups/`: (Optional) Folder containing `.jpg` and `.svg` files from your device's `.kobo/markups/` directory if you want to see handwritten notes.

3.  **Install dependencies**:
    ```bash
    bun install
    ```

4.  **Run the viewer**:
    ```bash
    bun dev
    ```
    Open **[http://localhost:4321](http://localhost:4321)** to browse your library.

---

## 📦 Building and Deployment

### 🏗️ Build (Windows)
Simply double-click the `build_site.bat` file in the project root.
*   ✅ Automatically generates the static site.
*   ✅ Copies your `markups/` folder into `dist/`.
*   ✅ Copies the deployment script `start-server.sh` into `dist/`.

### 🚀 Deploy (Raspberry Pi / Docker)
1.  Copy the entire content of the `dist/` folder to your Raspberry Pi.
2.  Ensure you have Docker installed.
3.  Run the server:
    ```bash
    chmod +x start-server.sh
    ./start-server.sh
    ```
    This launches an Nginx container serving your static site and images at port **8003**.



