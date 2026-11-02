# Namma Space: Additional Links & Prototype Directory
**Techfest 2026-27, IIT Bombay — Round 1 Submission Document**  
*Master Links & Access Document (Submission Guideline Compliant)*

---

## 1. Project Metadata
* **Project Name:** Namma Space
* **Team Name:** [Insert Team Name]
* **Team ID:** [Insert Techfest Team ID]
* **Challenge:** Namma Space (Indoor 3D Reconstruction & Spatial Navigation)
* **Round:** Round 1 (Online Submission)
* **Submission Date:** October 31, 2026

---

## 2. Core Submission Deliverables Directory

| Deliverable | Description | Access URL / Document Link |
|---|---|---|
| **Live 3D Web Viewer Demo** | Working zero-install interactive WebGL walkthrough (WASD + Mouse look + Floor Radar + POI inspection) | [https://namma-space.vercel.app](https://namma-space.vercel.app) *(or your deployed Vercel / Netlify URL)* |
| **Official Demonstration Video** | 3 to 5-minute video detailing capture SOP, pipeline walkthrough, and live 3D web exploration | [YouTube / Google Drive Video Link](https://youtu.be/example) |
| **Open-Source Code Repository** | Complete codebase containing Web Viewer, reconstruction pipeline, and sample dataset | [https://github.com/Omega131/Namma-Space](https://github.com/Omega131/Namma-Space) |
| **Round 1 Submission Google Drive Folder** | Master Drive folder with permissions set to *"Anyone with the link can view"* | [Google Drive Master Folder Link](https://drive.google.com/drive/folders/example) |

---

## 3. Repository & Prototype Structure

The repository is modularly structured into the following operational components:

* **`/web-viewer`**: Zero-install Three.js / Vite web application. Features first-person physics controls, raycasted floor & wall collisions, real-time minimap radar, POI modal inspection, and drag-and-drop custom model loading.
* **`/pipeline`**: Automated Python scripts for smartphone video ingestion, Laplacian variance blur filtering, and SfM camera pose generation (`transforms.json`).
* **`/sample_data`**: Sample test keyframes, manifest, and generated camera poses allowing immediate end-to-end testing without external downloads.
* **`/docs`**:
  * `SOP_DATA_COLLECTION.md`: Standard Operating Procedure for smartphone spatial mapping.
  * `TECHNICAL_ABSTRACT.md`: 5-Page technical abstract and mathematical specification.
  * `DEMO_VIDEO_SCRIPT.md`: Timestamped script for recording the 3-5 minute demo video.
  * `Additional_Links_and_Prototypes.pdf`: This master access catalog.

---

## 4. Quickstart Verification Guide for Reviewers

Reviewers can test the platform locally in under 2 minutes:

### Run Interactive Web Viewer:
```bash
# Clone the repository
git clone https://github.com/Omega131/Namma-Space.git
cd Namma-Space/web-viewer

# Install dependencies and launch
npm install
npm run dev
```
Navigate to `http://localhost:3000` to enter the 3D walkthrough immediately.

### Run Reconstruction Pipeline:
```bash
# Install Python dependencies
pip install -r pipeline/requirements.txt

# Run automated frame extraction and SfM camera pose solving on sample data
python pipeline/colmap_sfm.py --images sample_data/test_keyframes --output sample_data/test_sfm_output
```

