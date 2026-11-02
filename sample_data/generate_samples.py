import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def generate_sample_dataset():
    sample_dir = Path("sample_data/test_keyframes")
    sample_dir.mkdir(parents=True, exist_ok=True)
    
    num_frames = 16
    w, h = 960, 540
    
    rooms = [
        "Reception Lobby",
        "Reception Desk Counter",
        "Main Corridor Entrance",
        "Executive Lounge Corner",
        "Executive Lounge Sofa Area",
        "Boardroom Conference Table",
        "Conference 4K Display Screen",
        "North Hallway Portal",
        "Workstation Cluster A",
        "Engineering Desk Pods",
        "Pantry & Coffee Machine",
        "Kitchenette Dining Bar",
        "South Egress Corridor",
        "Emergency Exit Stairwell",
        "Indoor Ficus Plant Feature",
        "Floor Overview Central Hub"
    ]
    
    metadata = []
    
    for i in range(num_frames):
        # Create an architectural room frame
        img = Image.new("RGB", (w, h), color=(18 + i*2, 24 + i*2, 38 + i*3))
        draw = ImageDraw.Draw(img)
        
        # Draw floor and ceiling perspective lines
        draw.polygon([(0, h), (w, h), (int(w*0.8), int(h*0.65)), (int(w*0.2), int(h*0.65))], fill=(60 + i, 50, 40))
        draw.polygon([(0, 0), (w, 0), (int(w*0.8), int(h*0.2)), (int(w*0.2), int(h*0.2))], fill=(220, 225, 230))
        
        # Draw back wall
        draw.rectangle([(int(w*0.2), int(h*0.2)), (int(w*0.8), int(h*0.65))], fill=(240 - i*2, 243, 248))
        
        # Draw architectural accent panel
        draw.rectangle([(int(w*0.35), int(h*0.28)), (int(w*0.65), int(h*0.55))], fill=(15, 23, 42))
        
        # Draw text labels
        title = f"Namma Space Capture #{i+1:02d}: {rooms[i]}"
        draw.text((30, 30), title, fill=(255, 255, 255))
        draw.text((30, 60), f"Camera Height: 1.65m | Overlap: 75% | AE/AF: Locked", fill=(56, 189, 248))
        draw.text((int(w*0.38), int(h*0.4)), rooms[i], fill=(255, 255, 255))
        
        filename = f"frame_{i:04d}.jpg"
        img.save(sample_dir / filename, quality=95)
        
        metadata.append({
            "filename": filename,
            "scene_zone": rooms[i],
            "frame_idx": i,
            "simulated_fov": 75.0,
            "sharpness_score": 142.5 + (i * 3.2)
        })
        
    with open("sample_data/sample_manifest.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Generated {num_frames} sample keyframes in {sample_dir}")

if __name__ == "__main__":
    generate_sample_dataset()

