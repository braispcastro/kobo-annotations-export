# 📚 Kobo Annotations Viewer

![Bun](https://img.shields.io/badge/Bun-1.3-000000?style=flat&logo=bun&logoColor=white) ![Astro](https://img.shields.io/badge/Astro-5.16-FF5D01?style=flat&logo=astro&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white) ![Antigravity](https://img.shields.io/badge/Made%20with-Antigravity-9cf.svg) ![Vibe Coding](https://img.shields.io/badge/Vibe-Coding-FF69B4)

> A modern, local web viewer for your Kobo eReader annotations, capable of reading directly from the database without intermediate exports.

This project allows you to visualize your highlights and notes in a **premium interface** that respects the original context. It's built for speed, deep analytics, and aesthetics.

---

## ✨ Key Features

- **📚 Vocabulary: Words looked up**: New in v0.4.0!
- **📊 Kobo Insights Dashboard**: New in v0.3.0! Get a bird's-eye view of your reading habits. See total books read, total time spent reading (real hours), active books in progress, and your highlight color distribution.
- **⚡ Optimized Surgical SQL**: Re-engineered database engine that only fetches what you need. Zero overhead, near-instant loading even with massive libraries.
- **⚡ On-Demand Reading**: Reads directly from multiple `KoboReader.sqlite` backups. No CSV/JSON export steps needed.
- **🗄️ Multi-Database Support**: Manage and browse multiple versions or backups of your Kobo library from a single interface.
- **🎨 Visual Fidelity**: Accurately renders Kobo highlight colors (**Green**, **Blue**, **Pink**, **Yellow**).
- **✍️ Handwritten Markups**: Specialized support for Kobo Libra Colour handwritten annotations (SVG overlays over page screenshots).
- **🌗 Theme Switcher**: Includes a persistent **Light/Dark** mode toggle.
- **🔍 Advanced Search & Filtering**: Real-time search across highlights, notes, and chapters. Combine it with instant filters for type and original Kobo colors.
- **💎 Premium UI**: Modern aesthetic with **Glassmorphism** effects (sticky headers and filters), Inter typography, and responsive grid layout.

## 📸 Screenshots

<details>
  <summary><b>Click to expand the visual gallery</b></summary>
  <br>

  <p align="center">
    <b>📊 Reading Dashboard & 👥 Author Selection</b><br>
    <img src="screenshots/data-selector.png" width="400">
    <img src="screenshots/author-selector.png" width="400">
  </p>

  <p align="center">
    <b>🖍️ Annotations & ✍️ Handwritten Markups</b><br>
    <img src="screenshots/annotations.png" width="400">
    <img src="screenshots/markup-one.png" width="400">
  </p>

  <p align="center">
    <b>🌑 Dark Mode Aesthetics</b><br>
    <img src="screenshots/markup-two.png" width="800">
  </p>

</details>

## 🛠️ Tech Stack

This project is built with a modern, performance-first stack:

| Technology | Role | Why? |
| :--- | :--- | :--- |
| **[Astro](https://astro.build/)** | Web Framework | Dynamic SSR for real-time database access. |
| **[Bun](https://bun.sh/)** | Runtime & Package Manager | Instant startup and native SQLite support (`bun:sqlite`). |
| **[TypeScript](https://www.typescriptlang.org/)** | Language | Type safety for reliable database queries. |
| **[CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)** | Styling | Flexible theming and **Glassmorphism** effects via `backdrop-filter`. |

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
    The project expects your backups inside the `data/` folder. Create a subfolder for each backup:
    ```text
    data/
      MyBackup_2026/
        KoboReader.sqlite
        markups/ (Optional: handwritten notes)
    ```

3.  **Install dependencies**:
    ```bash
    bun install
    ```

4.  **Run the viewer**:
    ```bash
    bun --bun dev
    ```
    *Note: Use `--bun` to ensure the native SQLite driver is used correctly.*
    Open **[http://localhost:4321](http://localhost:4321)** to select a backup and explore your **Kobo Insights**.

---

## 📦 Building and Deployment

### 🏗️ Build (Windows)
Simply double-click the `build_site.bat` file in the project root.
*   ✅ Automatically builds the SSR application.
*   ✅ Prepares the `dist/` folder for deployment.
*   ✅ Creates an empty `data/` directory in the output for your backups.

### 🚀 Deploy (Raspberry Pi / Docker)
1.  Run `build_site.bat` on your Windows machine.
2.  Copy the **entire contents** of the `dist/` folder to your server (Raspberry Pi). This includes `Dockerfile`, `start-server.sh`, `package.json`, etc.
3.  Ensure you have Docker installed.
4.  Run the server on your Pi:
    ```bash
    chmod +x start-server.sh
    ./start-server.sh
    ```
    This builds/runs a optimized Bun container. The server will be active at port **8003**.
    Populate the `data/` folder on your server with your database backups to see them in the app.
