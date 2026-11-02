# Namma Space: End-to-End Intelligent Spatial Engine & Photorealistic Web Walkthrough
**Technical Abstract & System Architecture Report**  
*Techfest 2026-27, IIT Bombay — Round 1 Online Submission*

---

## 1. Executive Summary & Vision

Traditional indoor representation relies heavily on static, 2D architectural blueprints or fragmented photo carousels. These representations fail to convey spatial volume, depth, or intuitive wayfinding. 

**Namma Space** resolves this paradigm by delivering an autonomous, end-to-end spatial engine that converts commodity smartphone captures (4K video or photo bursts) into an interactive, photorealistic 3D digital twin. The digital twin is hosted inside a zero-install, browser-based WebGL/WebGPU runtime, offering:
1. **Unconstrained First-Person Exploration (WASD + Mouse Look):** Video-game style locomotion running at steady 60 FPS on desktop and mobile browsers.
2. **Kinematic Collision & Floor Snapping:** Raycasted collision geometry ensuring users navigate on realistic floor planes without phasing through walls or furniture.
3. **Interactive Point of Interest (POI) Tagging & Spatial Indexing:** Semantic metadata tags attached to 3D locations for instant search and teleportation.
4. **Architectural Dollhouse Mode & Live Minimap:** Real-time dual-view coordination pairing a top-down tactical radar with an immersive first-person viewpoint.

---

## 2. System Architecture & Pipeline Design

The Namma Space platform is structured as a decoupled, multi-stage pipeline transitioning from raw physical capture to client-side GPU-accelerated rendering:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STAGE 1: PHYSICAL CAPTURE                          │
│   • Smartphone 4K 60FPS Video    • Locked AE / AF / White Balance            │
│   • Multi-tier Trajectory (Eye-level, Floor pass, 360° POI orbits)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STAGE 2: INGESTION & FILTERING ENGINE                    │
│   • Laplacian Variance Blur Filtering: Var(ΔI) > τ                          │
│   • Inter-frame Structural Difference: D(I_t, I_{t-1}) > δ                  │
│   • Camera Intrinsic Normalization & Downscaling (4K -> 1080p)              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               STAGE 3: STRUCTURE-FROM-MOTION & 3D RECONSTRUCTION            │
│   • SIFT Feature Detection & Robust Epipolar Matching (RANSAC)              │
│   • Incremental Bundle Adjustment (COLMAP SfM): min Σ ||x_ij - P(C_i, X_j)||²│
│   • Camera Extrinsics & Intrinsics Export -> transforms.json                │
│   • 3D Gaussian Splatting (3DGS) / High-Fidelity Textured Mesh Baking       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                STAGE 4: SPATIAL OPTIMIZATION & WEB PACKAGING                │
│   • Coordinate System Alignment: Y-Up, Ground-Plane Leveling                │
│   • Mesh Decimation & Draco Compression (<15MB Web Payload)                 │
│   • Collision Bounding Volume Hierarchy (BVH) & Floor NavMesh Generation    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 STAGE 5: ZERO-INSTALL WEB EXPLORATION ENGINE                │
│   • Three.js / WebGL 2.0 Client Runtime (60 FPS)                            │
│   • PointerLock First-Person Controls (WASD + Shift Sprint + Gravity)       │
│   • Live Floor Radar / Minimap with Real-Time Player Heading                │
│   • Interactive 3D POI Hologram Pins + Search Catalog                       │
│   • Seamless Drag-and-Drop Loader for Custom Reconstructed Models           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Collection Standard Operating Procedure (SOP)

Capturing indoor environments with non-specialist hardware requires a standardized data capture SOP to avoid tracking failures, scale ambiguity, and visual artifacts:

### 3.1 Sensor Configuration
* **Sensor:** Primary wide camera lens (avoiding 0.5x ultra-wide due to severe radial distortion).
* **Exposure & Focus (Crucial):** **Locked Exposure (AE-Lock)** and **Locked Focus (AF-Lock)** at 2.0m. Dynamic exposure shifts induce brightness discrepancies across stereo pairs, degrading SfM photometric bundle adjustment.
* **Resolution:** 4K UHD (3840×2160) at 30 or 60 FPS.

### 3.2 Multi-Tier Walking Trajectory
1. **Perimeter Loop Walk (Eye Level, 1.6m – 1.7m):** A closed clockwise path maintaining 75%+ overlap between consecutive frames. Slow translation speed ($\le 0.5\text{ m/s}$) prevents motion blur.
2. **Inward Cross / POI Orbit (Chest Level, 1.3m – 1.4m):** Concentric passes around central architectural features (meeting tables, seating arrangements, counters) providing multi-view angular parallax.
3. **Floor-Level Sweep (Waist Level, 0.9m – 1.1m):** Downward tilted pass at 35° capturing floor surfaces, thresholds, and furniture legs to ensure accurate collision boundaries.

### 3.3 Mitigating Edge Cases
* **Specular & Reflective Surfaces (Mirrors / Glass):** Specular highlights violate Lambertian assumptions. Mirrors are masked or tagged with low-tack painter's tape anchors.
* **Featureless White Walls:** Temporary high-contrast markers or posters provide local feature descriptors for SIFT matching.

---

## 4. Algorithmic Reconstruction & Optimization Pipeline

### 4.1 Blur-Aware Keyframe Extraction
Raw video produces thousands of redundant or blurry frames. The extraction module evaluates the discrete Laplacian variance of each frame:

$$\text{Blur Score} = \text{Var}\left( \nabla^2 I \right) = \frac{1}{N} \sum_{x,y} \left( \nabla^2 I(x,y) - \mu \right)^2$$

Where $\nabla^2 I = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}$. Frames with $\text{Blur Score} < \tau_{\text{threshold}}$ are discarded. Additionally, temporal inter-frame difference metric:

$$\Delta_{\text{motion}} = \frac{1}{W \times H} \sum |I_t - I_{t-1}|$$

rejects static frames when the operator is stationary, reducing SfM matching complexity by $\approx 60\%$.

### 4.2 Camera Pose Estimation & Bundle Adjustment
Camera positions and orientations are recovered via incremental Structure-from-Motion (SfM). For each camera pose $C_i = [R_i \mid t_i]$ and 3D world landmark $X_j$, the reprojection error is minimized:

$$\min_{R_i, t_i, X_j} \sum_{i} \sum_{j} \rho\left( \left\| x_{ij} - \pi(K_i, R_i X_j + t_i) \right\|^2 \right)$$

where $\pi$ is the perspective projection operator, $K_i$ is the camera intrinsic matrix, and $\rho$ is the Huber loss function for outlier rejection. The solved poses are normalized to a metric coordinate system and exported into standard `transforms.json` format.

### 4.3 3D Spatial Representation Strategy
To balance visual photorealism with client-side performance, Namma Space adopts a hybrid representation:
1. **3D Gaussian Splatting (3DGS):** Continuous volumetric representation parameterized by center $\mu$, 3D covariance $\Sigma = R S S^T R^T$, opacity $\alpha$, and spherical harmonics (SH) color coefficients, exported as compressed `.splat` or `.ply` for photo-quality view synthesis.
2. **Textured Surface & Collision Mesh (GLTF/GLB):** Low-latency polygon mesh with baked PBR materials (Albedo, Roughness, Normal) and a convex-hull collision model, enabling instantaneous zero-install loading on any consumer laptop, phone, or tablet without dedicated GPU hardware.

---

## 5. Web Viewer Architecture & Interaction Engine

The Namma Space client is implemented in **Three.js / WebGL 2.0** bundled with **Vite**:

```
                         CLIENT RUNTIME ARCHITECTURE
┌────────────────────────────────────────────────────────────────────────┐
│                              RENDER ENGINE                             │
│  Three.js WebGLRenderer • ACESFilmic Tone Mapping • PCF Soft Shadows   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   LOCOMOTION &   │      │   INTERACTIVE    │      │  MINIMAP & DUAL  │
│    KINEMATICS    │      │    POI ENGINE    │      │  VIEW CONTROLLER │
│ • PointerLock    │      │ • 3D Pulsing     │      │ • Dynamic 2D     │
│ • WASD Deceler-  │      │   Hologram Pins  │      │   Canvas Radar   │
│   ation/Friction │      │ • Raycasting     │      │ • Real-time FOV  │
│ • Downward Ray   │      │   Detection      │      │   Vision Cone    │
│   Floor Snapping │      │ • Spatial Search │      │ • FPS <-> Orbit  │
│ • Waist Ray Wall │      │   & Catalog      │      │   Dollhouse Mode │
│   Collision Guard│      │ • Instant POI    │      │ • Live Latency & │
│ • Sprint/Jump    │      │   Teleportation  │      │   FPS Telemetry  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 5.1 First-Person Locomotion Kinematics
Movement incorporates Newtonian friction, mass damping, and collision response:

$$v_{t+\Delta t} = (v_t - \mu_{\text{friction}} v_t \Delta t) + a_{\text{input}} \Delta t$$
$$p_{t+\Delta t} = p_t + v_{t+\Delta t} \Delta t$$

* **Floor Collision & Elevation:** A continuous downward raycast from head height ($y_{\text{cam}} = 1.7\text{m}$) calculates the floor intersection point $y_{\text{floor}}$. The camera's vertical position is clamped to $y_{\text{floor}} + 1.7\text{m}$, simulating walking on uneven floors or ramps.
* **Obstacle Boundary Testing:** Four orthogonal horizontal raycasts at waist level ($y = 0.8\text{m}$) detect walls and furniture within a $0.6\text{m}$ buffer distance, nullifying velocity vectors in collision directions.

### 5.2 Real-Time Radar Minimap
A 2D canvas overlay tracks player coordinates in real time:

$$\begin{bmatrix} x_{\text{canvas}} \\ z_{\text{canvas}} \end{bmatrix} = \begin{bmatrix} \frac{x_{\text{world}} + W/2}{W} \times w_{\text{canvas}} \\ \frac{z_{\text{world}} + D/2}{D} \times h_{\text{canvas}} \end{bmatrix}$$

The canvas plots architectural wall footprints, active POI markers, player position, and a dynamic field-of-view (FOV) vision cone aligned with the camera's azimuthal yaw angle $\theta_{\text{yaw}}$.

---

## 6. Spatial Indexing & Foundation for Round 2

In Round 1, the POI framework is already fully architected:
* Every POI contains a 3D coordinate vector, human-readable name, semantic category, search keywords, and description.
* Hologram markers animate with sinusoidal vertical bobbing and opacity pulsing:

$$\text{Scale}(t) = 1.0 + 0.1 \sin(3.5t), \quad \alpha(t) = 0.4 + 0.4 \sin(3.5t)$$

* Clicking any POI or selecting it in the drawer triggers a direct transition, establishing the exact coordinate endpoints required for **Round 2 obstacle-aware A* NavMesh pathfinding**.

---

## 7. Open-Source Tools & License Attributions

Namma Space complies fully with Rule 4 of Techfest 2026-27. All open-source packages and frameworks utilized are credited below:

| Tool / Library | Version | License | Role in Pipeline |
|---|---|---|---|
| **Three.js** | `^0.170.0` | MIT License | WebGL 3D rendering engine, shaders, and camera controls |
| **Vite** | `^6.0.0` | MIT License | Next-generation frontend build tooling and local dev server |
| **COLMAP** | `3.8+` | BSD-3-Clause | Incremental Structure-from-Motion and camera pose estimation |
| **OpenCV (Python)**| `^4.8.0`| Apache 2.0 | Video decoding, Laplacian blur filtering, frame resizing |
| **NumPy & SciPy** | `^1.24.0` | BSD-3-Clause | Linear algebra, transform matrix mathematics, vector operations |
| **Pillow (PIL)** | `^10.0.0` | HPND License | Image manifest verification and dataset handling |

---

## 8. Summary of Round 1 Submission Verification

* **SOP Construction:** Comprehensive field-tested smartphone capture guide completed (`docs/SOP_DATA_COLLECTION.md`).
* **Interactive 3D Web Viewer:** Zero-install WebGL viewer with WASD + mouse look, collision detection, minimap radar, and POI indexing operational (`web-viewer/`).
* **Automated Pipeline Scripts:** Automated frame extraction, blur filtering, and SfM pose export scripts verified (`pipeline/`).
* **Sample Test Dataset:** Test keyframes, manifest, and generated camera poses bundled (`sample_data/`).
* **Master Submission Links Document:** Formatted for Google Drive submission (`docs/Additional_Links_and_Prototypes.md`).

