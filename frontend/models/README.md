# 3D Anatomy Models

2.  **File Naming:** The engine expects specific filenames to map to the Outliner layers:
    *   `skeleton.glb` (Layer 1: Skeletal system)
    *   `muscular_insertions.glb` (Layer 2: Muscular system)
    *   `cardiovascular.glb` (Layer 3: Cardiovascular system)
    *   `nervous.glb` (Layer 4: Nervous system & Sense organs)
    *   `visceral.glb` (Layer 5: Visceral systems)
3.  **Requirements:** The model should have a distinct hierarchy of meshes (e.g., separate meshes named "Heart", "Liver", "Skin") so the JavaScript code can target and highlight them.
