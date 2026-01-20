# Kobo Annotations Viewer

A modern, local web viewer for your Kobo eReader annotations, built with **Astro**, **Bun**, and **SQLite**.

Instead of exporting static files, this app reads directly from your `KoboReader.sqlite` database and presents your highlights and notes in a beautiful, searchable interface with a premium dark mode design.

## Features

- **Direct Database Access**: No intermediate files. Reads `KoboReader.sqlite` directly.
- **Modern UI**: Dark mode, glassmorphism, and responsive design.
- **Theme Switcher**: Toggle between **Light** and **Dark** modes with persistent preference.
- **Kobo Color Support**: Visualizes highlights in their original colors (Green, Blue, Pink, Yellow), adapted for both themes.
- **Fast**: Built on Bun and Astro for instant performance.

## Prerequisites

- **Bun**: [Install Bun](https://bun.sh/) (v1.0+)

## Quick Start

1.  Clone this repository.
2.  Place your `KoboReader.sqlite` file in the project root.
3.  Install dependencies:
    ```bash
    bun install
    ```
4.  Start the viewer:
    ```bash
    bun dev
    ```
5.  Open [http://localhost:4321](http://localhost:4321) in your browser.

## Building for Production

To generate a static version of your annotations (HTML files):

```bash
bun run build
```

The output will be in the `dist/` folder.
