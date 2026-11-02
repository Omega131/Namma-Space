#!/usr/bin/env python3
"""
Namma Space - End-to-End Autonomous Spatial Reconstruction Pipeline
Part of the Namma Space Project (Techfest 2026-27, IIT Bombay)

Unified orchestrator:
  1. Smartphone Video Ingestion
  2. Blur-Aware Keyframe Extraction
  3. Structure-from-Motion (SfM) Camera Pose Estimation
  4. 3D Model & Splat Preparation
  5. Web Viewer Staging & Deployment
"""

import os
import sys
import argparse
import time
from pathlib import Path

# Local pipeline modules
from extract_frames import extract_keyframes
from colmap_sfm import run_sfm


def banner():
    print("""
===================================================================
     _   _                               ____                        
    | \\ | | __ _ _ __ ___  _ __ ___   __/ ___| _ __   __ _  ___ ___ 
    |  \\| |/ _` | '_ ` _ \\| '_ ` _ \\ / _\\___ \\| '_ \\ / _` |/ __/ _ \\
    | |\\  | (_| | | | | | | | | | | | (_|___) | |_) | (_| | (_|  __/
    |_| \\_|\\__,_|_| |_| |_|_| |_| |_|\\__,|____/| .__/ \\__,_|\\___\\___|
                                     |___/     |_|                  
             Techfest 2026-27, IIT Bombay • Spatial Digital Twin
===================================================================
    """)


def run_pipeline(
    video_path: str = None,
    image_dir: str = None,
    output_dir: str = "output",
    fps: float = 2.0,
    blur_threshold: float = 75.0,
    target_format: str = "all"
):
    start_time = time.time()
    banner()

    out_base = Path(output_dir)
    out_base.mkdir(parents=True, exist_ok=True)

    frames_dir = out_base / "keyframes"
    sfm_dir = out_base / "sfm"
    model_dir = out_base / "web_ready"

    # Stage 1: Keyframe Extraction
    print("\n[STAGE 1/4] Ingesting & Quality-Filtering Video Data...")
    if video_path:
        count = extract_keyframes(
            video_path=video_path,
            output_dir=str(frames_dir),
            target_fps=fps,
            blur_threshold=blur_threshold
        )
        if count == 0:
            print("[ERROR] No sharp keyframes were retained. Check blur threshold.")
            return False
    elif image_dir:
        frames_dir = Path(image_dir)
        print(f"[INFO] Using existing keyframe folder: {frames_dir}")
    else:
        print("[ERROR] Must provide either --video or --images.")
        return False

    # Stage 2: Camera Pose Estimation & SfM
    print("\n[STAGE 2/4] Structure-from-Motion & Camera Trajectory Solving...")
    sfm_success = run_sfm(
        image_dir=str(frames_dir),
        output_dir=str(sfm_dir)
    )
    if not sfm_success:
        print("[ERROR] SfM estimation failed.")
        return False

    # Stage 3: 3D Representation & Web Staging
    print("\n[STAGE 3/4] Exporting Web-Optimized Spatial Model...")
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy transforms and manifest into web staging
    manifest_src = frames_dir / "extraction_manifest.json"
    if manifest_src.exists():
        import shutil
        shutil.copy(manifest_src, model_dir / "extraction_manifest.json")

    transforms_src = sfm_dir / "transforms.json"
    if transforms_src.exists():
        import shutil
        shutil.copy(transforms_src, model_dir / "transforms.json")

    # Stage 4: Ready for Web Viewer
    elapsed = time.time() - start_time
    print("\n[STAGE 4/4] Spatial Engine Pipeline Complete!")
    print("=" * 65)
    print(f" Total Turnaround Time : {elapsed:.2f} seconds")
    print(f" Keyframes Processed   : {frames_dir}")
    print(f" SfM Camera Poses      : {sfm_dir}")
    print(f" Web-Ready Artifacts   : {model_dir}")
    print("=" * 65)
    print("\nTo explore in the First-Person Web Viewer, run:")
    print("  1. cd web-viewer")
    print("  2. npm run dev")
    print("  3. Open http://localhost:3000 in your browser\n")
    return True


def main():
    parser = argparse.ArgumentParser(description="Namma Space Master Pipeline Orchestrator")
    parser.add_argument("--video", "-v", help="Path to input smartphone capture video (.mp4/.mov)")
    parser.add_argument("--images", "-i", help="Directory of pre-extracted image frames")
    parser.add_argument("--output", "-o", default="output", help="Root output directory")
    parser.add_argument("--fps", type=float, default=2.0, help="Extraction rate (default: 2.0 fps)")
    parser.add_argument("--blur-threshold", type=float, default=75.0, help="Min Laplacian variance")
    parser.add_argument("--format", choices=["splat", "mesh", "all"], default="all")
    args = parser.parse_args()

    run_pipeline(
        video_path=args.video,
        image_dir=args.images,
        output_dir=args.output,
        fps=args.fps,
        blur_threshold=args.blur_threshold,
        target_format=args.format
    )


if __name__ == "__main__":
    main()

