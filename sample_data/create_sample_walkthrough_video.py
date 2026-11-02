import cv2
import numpy as np
from pathlib import Path
import math

def create_sample_walkthrough_video():
    output_path = Path("sample_data/sample_indoor_walkthrough.mp4")
    w, h = 1280, 720
    fps = 30
    duration_sec = 15
    total_frames = fps * duration_sec

    # Codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (w, h))

    rooms = [
        ("Welcome Reception & Lobby", (20, 24, 38)),
        ("Executive Breakout Lounge", (28, 36, 52)),
        ("Boardroom & Conference Suite", (32, 28, 48)),
        ("Engineering Workstation Pods", (24, 32, 44)),
        ("Panoramic Window Sky Lounge", (18, 30, 50))
    ]

    print(f"[GENERATING] Creating realistic indoor walkthrough video ({total_frames} frames)...")

    for i in range(total_frames):
        t = i / total_frames
        room_idx = min(len(rooms) - 1, int(t * len(rooms)))
        room_name, base_color = rooms[room_idx]

        # Walking bob
        bob_y = int(math.sin(i * 0.3) * 6)
        bob_x = int(math.cos(i * 0.15) * 4)

        # Base frame background
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        frame[:] = base_color

        # Floor (perspective trapezoid)
        floor_pts = np.array([
            [0, h],
            [w, h],
            [int(w * 0.85 + bob_x), int(h * 0.6 + bob_y)],
            [int(w * 0.15 + bob_x), int(h * 0.6 + bob_y)]
        ], np.int32)
        cv2.fillPoly(frame, [floor_pts], (45, 65, 85))

        # Hardwood floor perspective lines
        for fx in range(int(w * 0.2), int(w * 0.8), 60):
            cv2.line(frame, (fx, int(h * 0.6 + bob_y)), (int(fx * 1.5 - w * 0.25), h), (35, 50, 70), 1)

        # Ceiling
        ceil_pts = np.array([
            [0, 0],
            [w, 0],
            [int(w * 0.85 + bob_x), int(h * 0.22 + bob_y)],
            [int(w * 0.15 + bob_x), int(h * 0.22 + bob_y)]
        ], np.int32)
        cv2.fillPoly(frame, [ceil_pts], (210, 215, 220))

        # Back Wall
        back_pts = np.array([
            [int(w * 0.15 + bob_x), int(h * 0.22 + bob_y)],
            [int(w * 0.85 + bob_x), int(h * 0.22 + bob_y)],
            [int(w * 0.85 + bob_x), int(h * 0.6 + bob_y)],
            [int(w * 0.15 + bob_x), int(h * 0.6 + bob_y)]
        ], np.int32)
        cv2.fillPoly(frame, [back_pts], (235, 240, 245))

        # Architectural timber slats or window
        wall_x1 = int(w * 0.35 + bob_x)
        wall_x2 = int(w * 0.65 + bob_x)
        cv2.rectangle(frame, (wall_x1, int(h * 0.28 + bob_y)), (wall_x2, int(h * 0.54 + bob_y)), (15, 23, 42), -1)

        # Baseboard trim line
        cv2.line(frame, (int(w * 0.15 + bob_x), int(h * 0.6 + bob_y)), (int(w * 0.85 + bob_x), int(h * 0.6 + bob_y)), (15, 23, 42), 4)

        # Onscreen smartphone capture HUD overlay
        cv2.putText(frame, f"SOP Smartphone Capture | 4K 60FPS | AE/AF: LOCKED", (36, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (56, 189, 248), 2)
        cv2.putText(frame, f"Zone: {room_name}", (36, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, f"Time: {i/fps:.1f}s / {duration_sec}s", (w - 240, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (148, 163, 184), 2)
        cv2.putText(frame, f"Loop Closure Trajectory Pass", (36, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (148, 163, 184), 2)

        out.write(frame)

    out.release()
    print(f"[SUCCESS] Generated test walkthrough video: {output_path} ({duration_sec}s, {w}x{h} @ {fps}fps)")

if __name__ == "__main__":
    create_sample_walkthrough_video()

