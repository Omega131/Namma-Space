# Namma Space: End-to-End Intelligent Spatial Engine
> **Techfest 2026-27, IIT Bombay** • Challenge Track: *Namma Space*  
> Transforming standard smartphone captures into photorealistic, interactive 3D digital twins with zero-install web exploration, spatial search, and obstacle-aware navigation.

[![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Key Features

* 🚀 **Zero-Install 3D Web Viewer:** Explore indoor digital twins directly in any browser at 60 FPS using standard PC first-person controls (WASD + Mouse Look).
* 📐 **Standard Operating Procedure (SOP):** Rigorous, repeatable smartphone capture protocol ensuring reliable multi-tier parallax, locked AE/AF calibration, and blur rejection.
* 🛡️ **Unbreakable Kinematic Locomotion & Wall-Sliding:** Double-height radial collision detection with smooth wall-projection sliding, solid ceiling bonk, and reliable ground snapping.
* 🗺️ **Real-Time Minimap / Tactical Radar:** 2D canvas HUD displaying architectural walls, live coordinates, and real-time camera FOV vision cone.
* 🔄 **Dual Viewport Modes:** Instantly toggle between first-person walkthrough (`WASD`) and an overhead isometric architectural dollhouse view (`Orbit`).
* 📦 **Automated Python Pipeline:** Blur-aware keyframe extraction (Laplacian variance), SfM camera pose solving, and export to standard `transforms.json`.
* 📂 **Drop-in Model Support:** Drag and drop custom `.glb` or `.gltf` 3D captures directly onto the browser window for instant live inspection.

---

## 🏗️ System Architecture

```
Physical Capture (Smartphone 4K Video @ 60 FPS, Locked AE/AF)
                           │
                           ▼
  [Keyframe Extraction & Laplacian Blur Quality Filter]
                           │
                           ▼
  [Structure-from-Motion (COLMAP) & Camera Pose Solver]
                           │
                           ▼
         [3D Spatial Representation & Web Export]
       ├── 3D Gaussian Splatting (.splat / .ply)
       └── Optimized Textured PBR Mesh & Collision Hull (.glb)
                           │
                           ▼
[Zero-Install WebGL 2.0 Engine (Three.js / Vite)]
  ├── First-Person Kinematics (PointerLock + WASD + Shift + Gravity + Wall-Sliding)
  ├── Real-time Floor Radar & Heading Indicator
  └── High-Resolution Anisotropic PBR Rendering & Studio IBL
```

---

## 🚀 Quickstart Guide

### 1. Launch the Interactive 3D Web Viewer
Ensure you have [Node.js](https://nodejs.org/) installed:

```bash
# Navigate to the web-viewer directory
cd web-viewer

# Install dependencies (Three.js & Vite)
npm install

# Start local high-performance development server
npm run dev
```

Open your browser at `http://localhost:3000`.  
* **Click to enter:** Lock mouse look.
* **W, A, S, D:** Walk through the space.
* **Shift:** Sprint.
* **V:** Toggle between First-Person Walkthrough and Overhead Dollhouse Orbit Mode.
* **Click on a Cyan Marker / Pin:** Inspect Point of Interest (POI) details.

To build an optimized production bundle:
```bash
npm run build
npm run preview
```

---

### 2. Run the Reconstruction Pipeline

Ensure you have Python 3.10+ installed:

```bash
# Install pipeline requirements
pip install -r pipeline/requirements.txt

# Run intelligent keyframe extraction with blur filter on any video
python pipeline/extract_frames.py --video sample_data/room_walkthrough.mp4 --fps 2.5 --blur-threshold 75.0

# Run camera pose estimation and sparse point cloud generation
python pipeline/colmap_sfm.py --images sample_data/test_keyframes --output output/sfm

# Or execute the unified master pipeline runner
python pipeline/pipeline_runner.py --images sample_data/test_keyframes --output output/
```

---

## 📁 Repository Directory Structure

```
Namma-Space/
├── docs/
│   ├── SOP_DATA_COLLECTION.md          # Complete Smartphone Capture Protocol
│   ├── TECHNICAL_ABSTRACT.md           # 5-Page Technical Abstract & Architecture
│   ├── DEMO_VIDEO_SCRIPT.md            # 3-5 Minute Demonstration Video Script
│   └── Additional_Links_and_Prototypes.md # Mandatory Master Link Directory
├── pipeline/
│   ├── extract_frames.py               # Blur-aware keyframe extraction (Laplacian Var)
│   ├── colmap_sfm.py                   # SfM camera pose solving & transforms.json export
│   ├── pipeline_runner.py              # Unified CLI pipeline orchestrator
│   └── requirements.txt                # Python dependencies
├── sample_data/
│   ├── test_keyframes/                 # Sample indoor test keyframe dataset
│   ├── sample_manifest.json            # Frame metadata and sharpness scores
│   └── generate_samples.py             # Test dataset generator
├── web-viewer/
│   ├── index.html                      # Entry HTML with HUD, Reticle, and Minimap
│   ├── package.json                    # Three.js & Vite dependencies
│   ├── vite.config.js                  # Vite server & build configuration
│   ├── public/                         # Static assets (favicons, textures)
│   └── src/
│       ├── main.js                     # Main application bootstrap & render loop
│       ├── style.css                   # Glassmorphic modern HUD styles
│       ├── controls/
│       │   ├── FirstPersonControls.js  # WASD + PointerLock + Kinematic Collisions
│       │   └── OrbitViewerControls.js  # Dollhouse overhead orbit controls
│       ├── models/
│       │   ├── IndoorScene.js          # Architectural digital twin & GLTF loader
│       │   └── POIManager.js           # 3D animated POI pins & spatial indexer
│       └── ui/
│           ├── Minimap.js              # Real-time 2D floor radar & FOV vision cone
│           └── HUD.js                  # UI coordinator, modal popups, drag-and-drop
└── README.md                           # Master project documentation
```

---

## 📋 Round 1 Submission Checklist (Due Oct 31, 2026)

| Deliverable | Location in Repo | Status |
|---|---|---|
| **Technical Abstract (Max 5 Pages)** | `docs/TECHNICAL_ABSTRACT.md` | ✅ Complete |
| **Data Collection SOP** | `docs/SOP_DATA_COLLECTION.md` | ✅ Complete |
| **Interactive Web Viewer POC** | `web-viewer/` | ✅ Complete & Verified |
| **Reconstruction Pipeline Scripts** | `pipeline/` | ✅ Complete & Verified |
| **Sample Test Dataset** | `sample_data/` | ✅ Complete |
| **3-5 Min Demo Video Script** | `docs/DEMO_VIDEO_SCRIPT.md` | ✅ Complete |
| **Master Links PDF Content** | `docs/Additional_Links_and_Prototypes.md` | ✅ Complete |

---

## 📜 Open Source Compliance & Credits

In compliance with Rule 4 of Techfest 2026-27, all open-source libraries and frameworks used are credited:
* **[Three.js](https://threejs.org/)** (MIT License) — WebGL rendering engine.
* **[Vite](https://vitejs.dev/)** (MIT License) — Frontend build and development environment.
* **[COLMAP](https://colmap.github.io/)** (BSD-3-Clause) — Structure-from-Motion photogrammetry.
* **[OpenCV Python](https://opencv.org/)** (Apache 2.0) — Computer vision and Laplacian blur detection.
* **[NumPy](https://numpy.org/)** & **[SciPy](https://scipy.org/)** (BSD-3-Clause) — Scientific vector math and transform matrices.

---

## 👥 Authors
Developed for **Techfest 2026-27**, IIT Bombay.
