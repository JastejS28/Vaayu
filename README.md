# PROJECT VAAYU

A comprehensive 3D UAV (Unmanned Aerial Vehicle) simulation built with React, Three.js, and React Three Fiber. This application provides realistic drone simulation capabilities including surveillance and attack drone modes, complete with terrain interaction, target detection, and anti-drone defense systems.

![React](https://img.shields.io/badge/React-18.x-blue)
![Three.js](https://img.shields.io/badge/Three.js-r150+-green)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Components Overview](#-components-overview)
- [State Management](#-state-management)
- [3D Models & Assets](#-3d-models--assets)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

## ✨ Features

### Drone Types

- **Surveillance UAV**: Reconnaissance drone for target detection and monitoring
- **Attack UAV**: Combat drone with missile systems and target lock capabilities

### Core Functionality

- 🎮 **Interactive 3D Environment**: Fully navigable 3D terrain with mountains, buildings, and military assets
- 🖱️ **Click-to-Move Controls**: Intuitive terrain clicking for UAV navigation
- 📹 **Multiple Camera Modes**: Third-person, first-person, and down-facing camera views
- 🌡️ **Thermal Vision**: Toggle thermal imaging for enhanced target detection
- 🔋 **Battery Management**: Realistic battery consumption and monitoring
- 🌤️ **Dynamic Weather**: Day, night, and rain environment settings
- 💨 **Wind Simulation**: Random wind gusts affecting flight conditions

### Mission System

- 📋 **Mission Planning**: Configure mission parameters before deployment
- ⏱️ **Timed Missions**: Mission duration tracking with automatic completion
- 📊 **Mission Results**: Comprehensive post-mission statistics and damage assessment
- 🎯 **Target Tracking**: Real-time target detection and surveillance progress

### Combat Features (Attack Drone)

- 🚀 **Missile System**: Lock-on targeting and missile launch capabilities
- 💥 **Explosion Effects**: Realistic explosion and fire effects
- 🎯 **Target Lock System**: Progressive lock-on mechanics
- 📈 **Damage Assessment**: Post-strike damage evaluation

### Defense Systems

- 📡 **Anti-Drone Radar**: Detection system for incoming UAVs
- 🛡️ **Defense Projectiles**: Automated missile defense
- 💣 **Defense Bombs**: Area denial weapons
- ⚠️ **UAV Damage System**: Realistic damage modeling and crash mechanics

### Targets

- 🛡️ **Tanks**: Armored vehicles with high thermal signatures
- 🚗 **Jeeps**: Light vehicles with medium detection difficulty
- 🏭 **Warehouses**: Large structures for surveillance
- 👤 **Soldiers**: Personnel targets requiring lower altitude detection

## 🎮 Demo

### Surveillance Mode

1. Select "Surveillance" drone type
2. Configure mission parameters (duration, targets)
3. Click on terrain to spawn UAV
4. Navigate to targets by clicking on them
5. Hover above targets to complete surveillance
6. Return to base before mission time expires

### Attack Mode

1. Select "Attack" drone type
2. Deploy UAV at desired location
3. Use coordinate controls or click-to-move
4. Lock onto targets using the targeting system
5. Launch missiles when lock is complete
6. Avoid anti-drone defense systems by flying below 20m altitude

## 🚀 Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/uav-simulation.git
cd uav-simulation
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

4. **Open in browser**

```
http://localhost:5173
```

5. **Build for Production**

```bash
npm run build
```

6. **Preview Production Build**

```bash
npm run preview
```

## 📖 Usage

### Controls

| Action | Control |
|--------|---------|
| Spawn UAV | Click on terrain (first time) |
| Move UAV | Click on terrain (after spawn) |
| Camera Rotation | Click and drag on 3D view |
| Camera Zoom | Mouse scroll wheel |
| Toggle Thermal | Switch in dashboard |
| Change Altitude | Use altitude slider |

### Dashboard Controls

#### Surveillance Dashboard

- **Coordinate Input**: Manual X, Y, Z position entry
- **Altitude Slider**: Adjust flight height (10-50m)
- **Thermal Vision Toggle**: Enable/disable thermal imaging
- **Target List**: View detected targets and surveillance progress

#### Attack Dashboard

- **Target Selection**: Choose targets for engagement
- **Missile Launch**: Fire when target lock is complete
- **Return to Base**: Emergency extraction button
- **Health Monitor**: Track drone damage status

## 📁 Project Structure

```
UAV/
├── public/
│   └── models/                 # 3D model assets
│       ├── army_base/          # Military base models
│       ├── building/           # Warehouse/structure models
│       ├── drone/              # UAV model files
│       ├── effects/            # Explosion and visual effects
│       ├── jeep/               # Jeep vehicle models
│       ├── mountain/           # Terrain models
│       ├── soldier/            # Personnel models
│       ├── sounds/             # Audio files
│       ├── surveillance-uav/   # Surveillance drone assets
│       └── tank/               # Tank models
├── src/
│   ├── components/             # React components
│   │   ├── anti-drone/         # Defense system components
│   │   ├── attack-drone/       # Attack drone components
│   │   ├── drone-selector/     # Drone type selection
│   │   ├── mission/            # Mission system components
│   │   └── ...                 # Other UI components
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state stores
│   ├── assets/                 # Static assets
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Global styles
│   ├── main.jsx                # Application entry point
│   └── index.css               # Base styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
└── eslint.config.js            # ESLint configuration
```

## 🏗️ Architecture

### Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Three.js | 3D graphics engine |
| React Three Fiber | React renderer for Three.js |
| @react-three/drei | Useful helpers for R3F |
| Zustand | State management |
| Material-UI | UI component library |
| Vite | Build tool and dev server |

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Input    │────▶│  Zustand Store  │────▶│   3D Scene      │
│  (Click/Keys)   │     │  (State Mgmt)   │     │  (Three.js)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Dashboard UI  │
                        │  (Material-UI)  │
                        └─────────────────┘
```

## 🧩 Components Overview

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| App | `App.jsx` | Main application container |
| Scene | `src/components/Scene.jsx` | 3D scene setup and rendering |
| UAV | `UAV.jsx` | UAV 3D model and rendering |
| UAVController | `UAVController.jsx` | UAV movement and physics |
| Terrain | `Terrain.jsx` | 3D terrain model |

### Dashboard Components

| Component | File | Description |
|-----------|------|-------------|
| CommandDashboard | `CommandDashboard.jsx` | Surveillance mode controls |
| AttackDashboard | `AttackDashboard.jsx` | Attack mode controls |
| BatteryIndicator | `BatteryIndicator.jsx` | Battery status display |
| LiveCameraView | `LiveCameraView.jsx` | UAV camera feed |

### Target Components

| Component | File | Description |
|-----------|------|-------------|
| Tank | `Tank.jsx` | Tank target entity |
| Jeep | `Jeep.jsx` | Jeep target entity |
| Warehouse | `Warehouse.jsx` | Building target |
| Soldier | `src/components/Soldier.jsx` | Personnel target |

### Anti-Drone System

| Component | File | Description |
|-----------|------|-------------|
| AntiDroneSystem | `AntiDroneSystem.jsx` | Main defense controller |
| DefenseProjectile | `DefenseProjectile.jsx` | Missile projectiles |
| DefenseBomb | `DefenseBomb.jsx` | Bomb weapons |
| RadarSweepEffect | `RadarSweepEffect.jsx` | Radar visualization |

### Attack Drone Components

| Component | File | Description |
|-----------|------|-------------|
| AttackUAV | `src/components/attack-drone/AttackUAV.jsx` | Attack drone entity |
| MissileSystem | `src/components/attack-drone/MissileSystem.jsx` | Missile firing logic |
| TargetLockSystem | `src/components/attack-drone/TargetLockSystem.jsx` | Target lock mechanics |
| FireEffect | `src/components/attack-drone/FireEffect.jsx` | Fire visual effects |
| CrashedUAV | `CrashedUAV.jsx` | Crashed drone debris |

### Environment Components

| Component | File | Description |
|-----------|------|-------------|
| DayEnvironment | `DayEnvironment.jsx` | Daytime lighting/sky |
| NightEnvironment | `src/components/NightEnvironment.jsx` | Nighttime settings |
| RainEnvironment | `RainEnvironment.jsx` | Rain weather effects |

### Mission Components

| Component | File | Description |
|-----------|------|-------------|
| MissionPlanningScreen | `MissionPlanningScreen.jsx` | Pre-mission setup |
| MissionHUD | `src/components/mission/MissionHUD.jsx` | In-mission display |
| MissionResultsScreen | `src/components/mission/MissionResultsScreen.jsx` | Post-mission stats |

## 🗄️ State Management

The application uses Zustand for state management with multiple specialized stores:

### UAV Store (`src/store/uavStore.js`)

```javascript
{
  position: [x, y, z],        // Current UAV position
  rotation: [rx, ry, rz],     // UAV rotation
  targetPosition: [x, y, z],  // Movement target
  isThermalVision: boolean,   // Thermal mode toggle
  isCrashed: boolean,         // Crash state
  battery: number,            // Battery percentage
  droneType: string,          // 'surveillance' | 'attack'
  targets: [],                // Detected targets
}
```

### Mission Store (`src/store/missionStore.js`)

```javascript
{
  missionStatus: string,      // 'planning' | 'active' | 'completed'
  missionParameters: {},      // Mission configuration
  missionTimeRemaining: number,
  completedObjectives: [],
}
```

### Attack Drone Store (`src/store/attackDroneStore.js`)

```javascript
{
  droneHealth: number,        // Health percentage
  targeting: {},              // Lock-on state
  destroyedTargets: [],       // Eliminated targets
  missiles: [],               // Active missiles
}
```

### Camera Store (`src/store/cameraStore.js`)

```javascript
{
  cameraMode: string,         // 'third-person' | 'first-person' | 'down-facing'
  cameraSettings: {},         // Per-mode configurations
}
```

### Target Store (`src/store/targetStore.js`)

```javascript
{
  detectedTargets: [],        // Currently visible targets
  completedTargets: {},       // Surveilled targets count
}
```

### Click Control Store (`src/store/clickControlStore.js`)

```javascript
{
  isClickToMoveEnabled: boolean,
  clickIndicator: {},         // Visual feedback position
  spawnIndicator: {},         // Spawn location marker
}
```

### Environment Store (`src/store/environmentStore.js`)

```javascript
{
  environment: string,        // 'day' | 'night' | 'rain'
  windSpeed: number,
  visibility: number,
}
```

## 🎨 3D Models & Assets

### Model Sources

All 3D models are licensed under CC-BY-4.0 and sourced from Sketchfab:

| Model | Author | Source |
|-------|--------|--------|
| UAV | Artem Goyko | Sketchfab |
| Terrain | Pukar Shiwakoti | Sketchfab |
| Tank | See license.txt | `public/models/tank/` |
| Jeep | See license.txt | `public/models/jeep/` |
| Building | See license.txt | `public/models/building/` |

### Audio Assets

Sound effects are located in `public/models/sounds/`:

- `explosion.mp3` - Explosion sound effects
- `explo.mp3` - Missile launch sounds

## ⚙️ Configuration

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Key Constants

#### UAV Settings

```javascript
// UAVController.jsx
const HOVER_HEIGHT = 15;           // Default hover altitude
const WIND_GUST_MIN_INTERVAL = 10; // Min seconds between gusts
const WIND_GUST_MAX_INTERVAL = 30; // Max seconds between gusts
```

#### Defense System

```javascript
// AntiDroneSystem.jsx
const RADAR_RADIUS = 50;           // Detection range
const MIN_SAFE_ALTITUDE = 20;      // Below this = stealth mode
```

#### Target Detection

```javascript
// Warehouse.jsx, Tank.jsx, etc.
const SCAN_RADIUS = 20;            // Target detection range
```



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 3D Model Licenses

The 3D models used in this project are licensed under CC-BY-4.0. Please see individual license files in the `public/models/` directories for attribution requirements.

## 🙏 Credits


### Technologies

- [React](https://react.dev/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
