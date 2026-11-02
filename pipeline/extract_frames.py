#!/usr/bin/env python3
"""
Namma Space - Intelligent Frame Extraction & Sharpness Filter
Part of the Namma Space Reconstruction Pipeline (Techfest 2026-27, IIT Bombay)

Extracts high-fidelity keyframes from smartphone video recordings, rejecting
blurry, redundant, or low-contrast frames via Laplacian variance and structural motion difference.
"""

import os
import sys
import argparse
import json
import cv2
import numpy as np
from pathlib import Path
from tqdm import tqdm


def calculate_blur_score(image: np.ndarray) -> float:
    """Computes blur metric using the variance of the Laplacian operator."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def calculate_frame_diff(frame1: np.ndarray, frame2: np.ndarray) -> float:
    """Calculates mean absolute difference between two consecutive frames."""
    gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gray1, gray2)
    return float(np.mean(diff))


def resize_frame(image: np.ndarray, max_dimension: int = 1920) -> np.ndarray:
    """Resizes frame keeping aspect ratio if larger than max_dimension."""
    h, w = image.shape[:2]
    if max(h, w) <= max_dimension:
        return image
    scale = max_dimension / float(max(h, w))
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def extract_keyframes(
    video_path: str,
    output_dir: str,
    target_fps: float = 2.0,
    blur_threshold: float = 80.0,
    min_diff_threshold: float = 3.5,
    max_dimension: int = 1920
):
    video_path = Path(video_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not video_path.exists():
        print(f"[ERROR] Video file not found: {video_path}")
        sys.exit(1)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[ERROR] Could not open video file: {video_path}")
        sys.exit(1)

    video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / video_fps

    frame_interval = max(1, int(round(video_fps / target_fps)))

    print("=" * 65)
    print("NAMMA SPACE: INTELLIGENT KEYFRAME EXTRACTION & FILTER")
    print("=" * 65)
    print(f" Source Video     : {video_path.name}")
    print(f" Total Frames     : {total_frames} ({duration:.1f}s @ {video_fps:.1f} FPS)")
    print(f" Target Extr Rate : {target_fps} FPS (Sample every {frame_interval} frames)")
    print(f" Blur Threshold   : {blur_threshold} (Laplacian Variance)")
    print(f" Max Dimension    : {max_dimension}px")
    print(f" Output Directory : {output_dir}")
    print("-" * 65)

    saved_frames = 0
    rejected_blurry = 0
    rejected_static = 0
    prev_saved_frame = None

    frame_metadata = []

    pbar = tqdm(total=total_frames, desc="Processing Frames", unit="fr")
    current_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if current_idx % frame_interval == 0:
            frame_resized = resize_frame(frame, max_dimension)
            blur_score = calculate_blur_score(frame_resized)

            if blur_score < blur_threshold:
                rejected_blurry += 1
            else:
                # Check for redundant static frame
                is_duplicate = False
                if prev_saved_frame is not None:
                    diff_score = calculate_frame_diff(prev_saved_frame, frame_resized)
                    if diff_score < min_diff_threshold:
                        rejected_static += 1
                        is_duplicate = True

                if not is_duplicate:
                    frame_filename = f"frame_{saved_frames:05d}.jpg"
                    frame_dest = output_dir / frame_filename
                    cv2.imwrite(str(frame_dest), frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 95])

                    timestamp = current_idx / video_fps
                    frame_metadata.append({
                        "file": frame_filename,
                        "frame_index": current_idx,
                        "timestamp_sec": round(timestamp, 2),
                        "blur_score": round(blur_score, 2),
                        "resolution": [frame_resized.shape[1], frame_resized.shape[0]]
                    })

                    prev_saved_frame = frame_resized
                    saved_frames += 1

        current_idx += 1
        pbar.update(1)

    cap.release()
    pbar.close()

    # Save extraction manifest
    manifest_path = output_dir / "extraction_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump({
            "source_video": str(video_path.name),
            "total_frames_extracted": saved_frames,
            "rejected_blurry": rejected_blurry,
            "rejected_static": rejected_static,
            "frames": frame_metadata
        }, f, indent=2)

    print("-" * 65)
    print(f"[SUCCESS] Extraction Complete!")
    print(f" -> Retained Sharp Keyframes : {saved_frames}")
    print(f" -> Rejected Blurry Frames   : {rejected_blurry}")
    print(f" -> Rejected Static Frames   : {rejected_static}")
    print(f" -> Metadata Manifest Saved  : {manifest_path}")
    print("=" * 65)
    return saved_frames


def main():
    parser = argparse.ArgumentParser(description="Namma Space Keyframe Extractor & Quality Filter")
    parser.add_argument("--video", "-v", required=True, help="Path to input smartphone capture video")
    parser.add_argument("--output", "-o", default="sample_data/extracted_frames", help="Output directory")
    parser.add_argument("--fps", type=float, default=2.5, help="Keyframes to extract per second (default: 2.5)")
    parser.add_argument("--blur-threshold", type=float, default=75.0, help="Min Laplacian variance (default: 75)")
    parser.add_argument("--max-dim", type=int, default=1920, help="Maximum image dimension (default: 1920)")
    args = parser.parse_args()

    extract_keyframes(
        video_path=args.video,
        output_dir=args.output,
        target_fps=args.fps,
        blur_threshold=args.blur_threshold,
        max_dimension=args.max_dim
    )


if __name__ == "__main__":
    main()

