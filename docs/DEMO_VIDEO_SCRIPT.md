# 3 to 5-Minute Demonstration Video Script: Namma Space
**Techfest 2026-27, IIT Bombay — Round 1 Video Guide**  
*Target Duration: 4 Minutes (Within 3–5 minute requirement)*

---

## Video Outline & Timestamp Summary

| Section | Timestamp | Focus Topic | On-Screen Action |
|---|---|---|---|
| **1. Introduction** | `0:00 - 0:45` | Challenge Problem & Vision | Title slide, team introduction, 2D blueprints vs 3D digital twins |
| **2. Capture SOP** | `0:45 - 1:45` | Data Collection Procedure | Smartphone capture footage, AE/AF lock, multi-tier loops, corner pans |
| **3. Pipeline** | `1:45 - 2:30` | Ingestion & SfM Solving | CLI script running, blur filter rejection, transforms.json camera poses |
| **4. Web Walkthrough** | `2:30 - 3:30` | Zero-Install 3D Web Viewer | First-person WASD roam, collision test, minimap radar, POI click |
| **5. Roadmap & Conclusion**| `3:30 - 4:00` | Round 2 & Finale Readiness | POI pathfinding preview, AR navigation vision, concluding remarks |

---

## Detailed Scene-by-Scene Script

### Scene 1: Introduction & Project Scope (0:00 – 0:45)
* **Visual:** Clean presentation slide displaying *"Techfest 2026-27: Namma Space — End-to-End Intelligent Spatial Engine"*, followed by the team names and ID.
* **Speaker Voiceover:**
  > "Hello judges and reviewers! Welcome to our Round 1 presentation for Namma Space at Techfest, IIT Bombay. 
  > Navigating large, unfamiliar indoor venues—like university campuses, corporate offices, or retail stores—is still dominated by static, confusing 2D blueprints. 
  > Our mission with Namma Space is to eliminate this barrier: converting ordinary smartphone videos into photorealistic, interactive 3D digital twins accessible instantly through any web browser, complete with intuitive first-person walkthroughs, obstacle-aware navigation, and point-of-interest search."

---

### Scene 2: Standard Operating Procedure (SOP) in Action (0:45 – 1:45)
* **Visual:** Split screen or over-the-shoulder video showing a team member recording an indoor room with a smartphone. Close-up of the phone screen showing **AE/AF Lock** engaged.
* **Speaker Voiceover:**
  > "To ensure anyone without technical expertise can map a space, we developed a standardized capture protocol:
  > First, we set the camera to 4K resolution at 60 FPS and lock Auto-Exposure and Auto-Focus at 2 meters. This eliminates the photometric and focal length fluctuations that often break 3D reconstruction.
  > Second, we walk a closed perimeter loop at a steady half-meter per second, maintaining over 75% overlap between frames.
  > Third, we execute a multi-tier trajectory: an eye-level pass for room boundaries, an inward cross pass for central furniture, and a low-angle floor pass to ensure clean ground surfaces for collision meshes.
  > Notice how we smoothly pan across corners and close the loop to anchor our bundle adjustment."

---

### Scene 3: Automated Reconstruction Pipeline (1:45 – 2:30)
* **Visual:** Screen recording of terminal running `python pipeline/pipeline_runner.py`. Show the progress bar, the extraction manifest, blur rejection stats, and the generated camera pose trajectory.
* **Speaker Voiceover:**
  > "Once the capture is uploaded, our autonomous reconstruction pipeline takes over:
  > Step 1: Intelligent frame extraction. Our blur detection algorithm evaluates the Laplacian variance of each frame, automatically discarding motion-blurred or static redundant frames.
  > Step 2: Camera pose estimation. Our Structure-from-Motion engine performs SIFT feature matching and bundle adjustment, generating camera extrinsics and intrinsics exported to standard transforms.json.
  > Step 3: We prepare web-ready assets—combining 3D Gaussian Splatting and optimized textured meshes with baked collision boundaries, keeping total download payloads under 15 megabytes."

---

### Scene 4: Interactive Web Walkthrough Demo (2:30 – 3:30)
* **Visual:** Full-screen browser window running the Namma Space Web Viewer at `http://localhost:3000` (or live URL).
* **Demonstration Actions:**
  1. *[2:30]* Click **"Play Demo Tour"** or **"Demo Tour (Video)"** in the top bar. The camera begins a cinematic, steady automated video walkthrough through the entire space.
  2. *[2:45]* Point out the **real-time Minimap Radar** in the top right, showing the live player marker and camera vision cone tracking the video trajectory in real time.
  3. *[3:00]* Click **"Exit to Free Walk"** or press `ESC` to seamlessly switch into **Free Walk (WASD)** first-person exploration. Walk forward, sprint with `Shift`, and demonstrate wall-sliding physics along walls and partitions without clipping or getting stuck.
  4. *[3:15]* Jump with `Space` to demonstrate the solid ceiling collision preventing jumping through the roof.
  5. *[3:20]* Press **'V'** or click the header toggle to switch into **Dollhouse (Orbit) Mode**, orbiting around the entire architectural space from above.
* **Speaker Voiceover:**
  > "Here is our live Web Viewer running in a standard Chrome browser with zero installation. 
  > You can immediately trigger our automated Demo Walkthrough Mode, which replicates a smooth, steady camera tour through the space—visiting the reception foyer, executive lounge, boardroom suite, and panoramic window facade.
  > At any point, users can take manual first-person control with WASD and mouse look.
  > Notice our rock-solid movement physics: diagonal wall-sliding prevents players from getting stuck on door frames, ground raycasting maintains realistic eye height, and solid ceiling collision prevents clipping through the roof.
  > In the top-right corner, our real-time minimap radar tracks your position and field-of-view in real time.
  > We can also switch seamlessly into Dollhouse Orbit Mode to inspect the entire floor layout from a bird's-eye perspective."

---

### Scene 5: Roadmap to Round 2 & Finale (3:30 – 4:00)
* **Visual:** Return to summary slide showing the Namma Space timeline, with Round 1 checked and Round 2 (Obstacle-aware A* pathfinding) & Round 3 (On-site AR camera navigation) highlighted.
* **Speaker Voiceover:**
  > "With our SOP validated, our reconstruction pipeline automated, and our 60 FPS web viewer fully operational, Namma Space has established a robust spatial foundation.
  > In Round 2, we are expanding our indexed POIs into live obstacle-aware A* NavMesh pathfinding—drawing dynamic glowing floor routes around furniture directly to searched destinations.
  > And for the IIT Bombay grand finale, we look forward to deploying on-site mobile AR navigation with real-time camera tracking.
  > Thank you for your time and evaluation!"

---

## Recording Tips for the Team
* **Audio:** Use a dedicated headset or USB microphone in a quiet room.
* **Screen Resolution:** Record your desktop at 1080p (1920×1080) at 60 FPS using OBS Studio or Windows Game Bar (`Win + G`).
* **Mouse Cursor:** Keep mouse movement steady during the 3D walkthrough; avoid sudden frantic movements.
* **Duration Check:** Rehearse once with a stopwatch to make sure the final exported video is between **3:00 and 4:30 minutes**.

