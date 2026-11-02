# Standard Operating Procedure (SOP): Indoor Spatial Capture
**Project: Namma Space — End-to-End Intelligent Spatial Engine**  
*Techfest 2026-27, IIT Bombay*

---

## 1. Objective & Purpose
This Standard Operating Procedure (SOP) defines a repeatable, robust, and consumer-accessible protocol for capturing indoor physical environments (residential homes, office floors, retail stores) using a standard smartphone. 

Adherence to this SOP guarantees sufficient geometric parallax, uniform visual features, and minimal motion distortion—enabling fully automated 3D reconstruction (Structure-from-Motion, 3D Gaussian Splatting, and textured mesh baking) with zero manual 3D modeling.

---

## 2. Hardware & Device Setup

### 2.1 Smartphone Specifications
* **Camera Type:** Primary wide-angle lens (typically ~24mm–26mm full-frame equivalent). Avoid ultra-wide (0.5x) or telephoto lenses to eliminate extreme barrel distortion or focal breathing.
* **Recording Mode:** Video capture at **4K (3840×2160) at 30 FPS or 60 FPS**. If video is not feasible, capture continuous burst high-resolution still photos.
* **Aspect Ratio:** Standard 16:9 or 4:3 landscape orientation.
* **Stabilization:** Enable smartphone Optical Image Stabilization (OIS) / Electronic Image Stabilization (EIS) where available, or mount the phone on a handheld 3-axis gimbal or monopod.

### 2.2 Camera Sensor Settings (Crucial)
1. **Auto-Exposure Lock (AE-Lock):** **MANDATORY**. Lock exposure on a mid-tone surface before beginning each capture pass. Automatic exposure fluctuations cause photogrammetry and radiance field gradient instability.
2. **Auto-Focus Lock (AF-Lock):** **MANDATORY**. Lock focus at approximately 2.0 to 2.5 meters. Continual autofocus changes the effective focal length ($f_x, f_y$), breaking camera calibration matrices.
3. **White Balance (WB):** Set fixed manual white balance (e.g., 5000K daylight or 3200K tungsten) or lock WB alongside AE/AF.

---

## 3. Environmental Pre-Capture Protocol

Before pressing record, the physical environment must be conditioned:

1. **Illumination Consistency:**
   - Turn on all ceiling lights and interior lamps to achieve even, diffuse illumination.
   - Close window blinds/sheers if direct outdoor sunlight creates harsh moving glare or high-contrast sun spots on the floor.
2. **Eliminating Dynamic Elements:**
   - Ensure the space is completely vacant of moving humans, pets, rotating fans, or dynamic TV screens.
   - Fix all interior doors into an **OPEN** position. Never open or close a door midway through the capture.
3. **Mitigating Challenging Surfaces:**
   - **Mirrors & Highly Specular Glass:** Photogrammetry fails on pure specular reflections. Cover large mirrors with semi-transparent paper, painter's tape, or spray with a light water mist / removable chalk spray if permissible.
   - **Uniform Featureless White Walls:** Modern SfM requires visual texture. If a corridor has vast blank walls, temporarily attach painter's tape crosses ($+$) or colorful sticky notes at 1.5m intervals to provide stable SIFT feature anchors.
4. **Physical Scale Reference:**
   - Place a known standard object (e.g., a 1.0m folding ruler or an A4 paper sheet: $210 \times 297\text{ mm}$) flat on the floor in the central room to provide real-world metric calibration ($1\text{ unit} = 1\text{ meter}$).

---

## 4. Walking Trajectory & Execution Protocol

Captures must follow a systematic multi-tier multi-pass trajectory:

```
                          CORRIDOR / ROOM PERIMETER
    ┌─────────────────────────────────────────────────────────────┐
    │  [Pass 1: Clockwise Outer Perimeter Walk @ 1.6m eye-level]   │
    │  ┌───────────────────────────────────────────────────────┐  │
    │  │  [Pass 2: Inward Cross & Figure-8 Pattern]            │  │
    │  │  ┌─────────────────────────────────────────────────┐  │  │
    │  │  │  [Pass 3: Low-Angle Floor & Obstacle Pass @ 1.0m]│  │  │
    │  │  │                                                 │  │  │
    │  │  │                   CENTER POI                    │  │  │
    │  │  │                                                 │  │  │
    │  │  └─────────────────────────────────────────────────┘  │  │
    │  └───────────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────┘
```

### Pass 1: Outer Perimeter Loop (Eye-Level: 1.6m – 1.7m)
* **Goal:** Reconstruct all walls, doors, windows, and perimeter boundaries.
* **Execution:**
  1. Stand 1.0m away from the wall, facing parallel or angled 45° towards the opposite wall.
  2. Walk continuously at a slow, deliberate pace (**0.5 meters per second**; roughly 1 step every 1.5 seconds).
  3. Ensure at least **70% to 80% overlap** between consecutive frames.
  4. Perform smooth "corner sweeps": at every room corner, pause translation and pan smoothly across 90° over 4 seconds.
  5. Close the loop by returning to the exact starting coordinates. Loop closure eliminates cumulative drift in the SfM bundle adjustment.

### Pass 2: Inward Cross / Figure-8 Trajectory
* **Goal:** Capture interior furniture, tables, seating, and spatial partitions.
* **Execution:**
  1. Walk an internal cross ($+$) or "Figure-8" trajectory through the middle of the room.
  2. Keep the camera pointed towards room centers and key Points of Interest (POIs).
  3. Perform a 360° orbital walk around key central obstacles (e.g., conference tables, kitchen islands, reception desks).

### Pass 3: Low-Angle Floor & Baseboard Pass (Waist-Level: 0.9m – 1.1m)
* **Goal:** Ensure accurate ground-plane extraction, rug boundaries, low table legs, and obstacle-avoidance NavMesh baking.
* **Execution:**
  1. Angle the camera downward at approximately 30° to 45°.
  2. Walk through all navigable corridors and doorways.
  3. This ensures floor-level geometric continuity for collision detection and pathfinding.

---

## 5. Post-Capture Quality Control Checklist

Before running the automated reconstruction pipeline, verify the capture pass against the following criteria:

| Checklist Item | Verification Standard | Pass/Fail |
|---|---|---|
| **Exposure Stability** | No sudden brightness jumps or blown-out highlights | [ ] |
| **Focus Sharpness** | Zero focus hunting; foreground and background sharp | [ ] |
| **Motion Blur** | Crisp edges when paused; walk speed $\le 0.5\text{ m/s}$ | [ ] |
| **Loop Closure** | Starting and ending positions overlap within 0.5m | [ ] |
| **Coverage Overlap** | All room zones visible from at least 3 distinct camera poses | [ ] |
| **Static Geometry** | No moving objects, animals, or modified door states | [ ] |

---

## 6. Pipeline Ingestion Command
Once verified, copy the video file to the workstation and execute the automated ingestion pipeline:

```bash
# Ingest smartphone video with automatic blur filtering and SfM pose solving
python pipeline/pipeline_runner.py --video path/to/capture.mp4 --fps 2.5 --blur-threshold 75.0 --output output/
```

