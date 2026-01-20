# 📚 Kobo Annotations Viewer

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Astro](https://img.shields.io/badge/Astro-5.0-orange.svg) ![Bun](https://img.shields.io/badge/Bun-1.0-black.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

> A modern, local web viewer for your Kobo eReader annotations, capable of reading directly from the database without intermediate exports.

This project allows you to visualize your highlights and notes in a **premium interface** that respects the original context. It's built for speed and aesthetics.

---

## ✨ Key Features

- **⚡ Zero Export**: Reads directly from `KoboReader.sqlite`. No CSV/JSON export steps needed.
- **🎨 Visual Fidelity**: Accurately renders Kobo highlight colors (**Green**, **Blue**, **Pink**, **Yellow**).
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

2.  **Add your database**:
    Copy your `KoboReader.sqlite` file (found in the `.kobo` folder of your reader) to the root of this project.

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

## 📦 Building for Production

You can generate a completely static website (HTML files) to save your annotations forever or share them.

### Option A: One-Click Build (Recommended)
Simply double-click the `build_site.bat` file in the project root.
*   ✅ Cleans previous builds.
*   ✅ Generates new static files.
*   ✅ Reports status.

### Option B: Manual Build
```bash
bun run build
```

The generated files will be inside the `dist/` folder.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
