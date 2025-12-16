<h1 align="center">GeoMapy 🌍📍</h1>

<img src="./public/icon.png" height="150" align="right">

Welcome to **GeoMapy**, an interactive web application designed to map, annotate, and manage points of interest and geographic zones.

Initially conceived for field survey needs (structural engineering type), this tool allows creating visual notes on a map, tracing zones, and easily exporting data.

🔗 Go to https://geomapy.vercel.app/ to view the project.

## 📸 Project's Screenshots

![main page](./public/screenshot.png)

## 🚀 Key Features

### 🗺️ Advanced Mapping

- **Interactive Map**: Based on OpenStreetMap and Leaflet.
- **Shape Drawing**: Advanced drawing tools (Polygons, Lines, Rectangles) via `Geoman`.
- **Custom Markers**: Add points with titles, notes, and customizable icons.
- **Address Search**: Integrated search bar for quick positioning.
- **Mini-Map**: Overview map for better orientation.

### 📝 Data Management

- **Control Sidebar**: List of points and traced zones.
- **Import / Export**:
  - Export data in **JSON** or **CSV**.
  - Support for **ZIP** files for complete exports.
  - Import existing data.
- **Persistence**: Automatic saving in the browser (LocalStorage) via Zustand. No data is stored on a server.

### 🛠️ Utility Tools

- **Developer Mode**: Stress-test buttons and test point generation.
- **Modern Interface**: Polished UI/UX with Shadcn/UI and smooth animations.

## 💻 Technical Stack

The project uses a modern and performant stack:

| Category   | Technologies                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**   | ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) |
| **Styles** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan) ![Shadcn/UI](https://img.shields.io/badge/Shadcn_UI-Latest-black)                                    |
| **Map**    | Leaflet, React-Leaflet, Geoman (Drawing), Turf.js (Calculations)                                                                                                       |
| **State**  | Zustand (Global state management)                                                                                                                                      |
| **Utils**  | Zod (Validation), PapaParse (CSV), JSZip                                                                                                                               |

## 📦 Installation & Getting Started

Make sure you have **Node.js** and **PNPM** installed.

1. **Clone the project**

   ```bash
   git clone <your-repo>
   cd GeoMapy
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

   The application will be accessible at `http://localhost:5173`.

4. **Build for production**
   ```bash
   pnpm build
   ```

## 📂 Project Structure

Here is an overview of the source code organization:

```
src/
├── components/
│   ├── map/           # Components related to the map (View, Controls, Popups)
│   ├── sidebar/       # Sidebar components (Lists, Actions)
│   ├── dialogs/       # Modales (Export, Import, Delete)
│   ├── ui/            # Base components (Shadcn/UI)
│   └── shared/        # Reusable components (Forms, Lists)
├── lib/               # Utilities and configurations (Map setup, Utils)
├── store/             # Global state management (Zustand)
├── types/             # TypeScript definitions
├── utils/             # Export/Import logic
└── pages/             # Main pages (MainMap)
```

## 🛡️ Best Practices

This project follows defined code standards:

- **Linting**: `pnpm lint` to check code quality.
- **Architecture**: Clear separation between UI, Logic (Hooks/Store), and Data.
- **Clean Code**: Explicit variables, short functions, and strict typing.

---

_Made with ❤️ by [Baptiste Lechat](https://github.com/baptistelechat)_
