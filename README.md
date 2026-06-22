# BlueGrid Enterprise Monitoring Dashboard

A premium, modern enterprise monitoring dashboard built with React and Vite. It provides real-time telemetry visualizations, system logs analysis, custom interactive SVG charts, and a terminal command simulator for managed Linux fleet nodes.

## 🚀 Key Features

- **Real-Time Fleet Telemetry**: Live widgets tracking CPU load, Memory allocation, and Network activity across nodes.
- **Linux Fleet Command Terminal**: An interactive terminal simulator for executing system administration commands on Ubuntu, Rocky Linux, and Debian nodes.
- **Streamlined Log Explorer**: Consolidated real-time daemon logs from fleet servers with auto-scroll and keyword search capabilities.
- **Interactive SVG Charts**: Custom-built high-performance SVG line charts and bar charts supporting dynamic resize scaling and interactive hover tooltips.
- **Workspace Customizer Drawer**: Allows quick customization of active widget rows, update frequency controls, dark/light theme switching, and accessibility font size scaling.
- **Clean Component Architecture**: Fully modular codebase utilizing the Component-as-a-Folder layout.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tooling**: [Vite 5](https://vite.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Vanilla CSS with HSL variables (highly optimized for light/dark theme shifts)
- **Icons**: Custom React SVG components

---

## 📂 Project Structure

The project has been organized with a self-contained, modular component directory:

```text
src/
├── App.jsx              # Main dashboard application layout & telemetry coordination
├── index.css            # Core global stylesheets, layout frame, variables and resets
├── main.jsx             # Entrypoint
├── mockData.js          # Telemetry and logging stream generators
│
├── components/          # Self-contained modular React components
│   ├── AlertLogsTab/
│   ├── CustomizerDrawer/
│   ├── DashboardTab/
│   ├── Header/
│   ├── LinuxFleetTab/
│   ├── LogExplorerTab/
│   ├── ServerInspectModal/
│   ├── Sidebar/
│   ├── SvgCharts/
│   ├── Icons.jsx        # Shared SVG Icon primitives
│   ├── NodeFleetTab.jsx # Shared Node details layout
│   └── UiKit.jsx        # Core reusable custom UI components (Buttons, Modals, Cards)
│
└── utils/
    ├── apiClient.js     # Centralized HTTP request coordinator (Axios configuration)
    └── statusHelper.js  # Helper for mapping component and health status properties
```

---

## 🏁 Getting Started

### 📋 Prerequisites

Make sure you have Node.js (version 18+) installed.

### ⚙️ Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone <repository-url>

# Install npm packages
npm install
```

### 💻 Running Locally

Start the Vite development server:

```bash
npm run dev
```

The application will run locally at `http://localhost:5173`.

### 📦 Building for Production

Compile and bundle the application for production:

```bash
npm run build
```

The compiled static assets will be outputted to the `/dist` directory.