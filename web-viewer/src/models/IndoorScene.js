import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class IndoorScene {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.collisionObjects = [];
    this.interactiveObjects = [];
    this.lights = [];
    this.gltfLoader = new GLTFLoader();

    this.sceneGroup = new THREE.Group();
    this.scene.add(this.sceneGroup);

    this.maxAnisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 16;
    this.textures = this.generateProceduralTextures();
    this.initLighting();
    this.buildHighFidelityDigitalTwin();
  }

  generateProceduralTextures() {
    const maxAniso = this.maxAnisotropy || 16;

    // 1. Ultra-Crisp Luxury Oak Hardwood Parquet (1024x1024)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d');

    // Rich warm oak background
    fctx.fillStyle = '#8b5a2b';
    fctx.fillRect(0, 0, 1024, 1024);

    const plankH = 64;
    const plankW = 256;
    for (let row = 0; row < 1024; row += plankH) {
      const offsetX = (row / plankH) % 2 === 0 ? 0 : plankW / 2;
      for (let col = -plankW; col < 1024 + plankW; col += plankW) {
        const x = col + offsetX;
        // Subtle plank-to-plank wood tone variation
        const hash = ((x * 17 + row * 31) % 40) - 20;
        const r = Math.min(255, Math.max(0, 165 + hash));
        const g = Math.min(255, Math.max(0, 120 + hash));
        const b = Math.min(255, Math.max(0, 80 + hash));
        fctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        fctx.fillRect(x + 2, row + 2, plankW - 4, plankH - 4);

        // Organic wood grain fine lines
        fctx.fillStyle = 'rgba(70, 40, 15, 0.12)';
        for (let s = 0; s < 14; s++) {
          const sy = row + 4 + Math.random() * (plankH - 8);
          fctx.fillRect(x + 2, sy, plankW - 4, 1.2);
        }

        // Dark beveled micro-groove
        fctx.fillStyle = '#2d180a';
        fctx.fillRect(x, row, plankW, 2);
        fctx.fillRect(x, row, 2, plankH);
      }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(6, 6);
    floorTex.anisotropy = maxAniso;

    // 2. Carrara Marble Texture for Table Tops & Reception (512x512)
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 512;
    marbleCanvas.height = 512;
    const mctx = marbleCanvas.getContext('2d');
    mctx.fillStyle = '#f8fafc';
    mctx.fillRect(0, 0, 512, 512);

    // Natural stone veining
    mctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    mctx.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) {
      mctx.beginPath();
      let cx = Math.random() * 512;
      let cy = 0;
      mctx.moveTo(cx, cy);
      while (cy < 512) {
        cx += (Math.random() - 0.5) * 50;
        cy += Math.random() * 55;
        mctx.lineTo(cx, cy);
      }
      mctx.stroke();
    }
    const marbleTex = new THREE.CanvasTexture(marbleCanvas);
    marbleTex.wrapS = THREE.RepeatWrapping;
    marbleTex.wrapT = THREE.RepeatWrapping;
    marbleTex.anisotropy = maxAniso;

    // 3. Architectural Matte Wall Drywall Texture (512x512)
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wctx = wallCanvas.getContext('2d');
    wctx.fillStyle = '#f8fafc';
    wctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 18000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.035;
      wctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      wctx.fillRect(x, y, 2, 2);
    }
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(4, 4);
    wallTex.anisotropy = maxAniso;

    // 4. Framed Gallery Art Texture (512x384)
    const artCanvas = document.createElement('canvas');
    artCanvas.width = 512;
    artCanvas.height = 384;
    const actx = artCanvas.getContext('2d');
    actx.fillStyle = '#0f172a';
    actx.fillRect(0, 0, 512, 384);

    const grad = actx.createLinearGradient(0, 0, 512, 384);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#f59e0b');
    actx.fillStyle = grad;
    actx.beginPath();
    actx.arc(256, 192, 140, 0, Math.PI * 2);
    actx.fill();

    actx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    actx.fillRect(80, 160, 350, 4);
    actx.font = 'bold 22px sans-serif';
    actx.fillText('NAMMA SPACE • SPATIAL TWIN', 85, 140);

    const artTex = new THREE.CanvasTexture(artCanvas);
    artTex.anisotropy = maxAniso;

    // 5. Scenic Outdoor Skyline Panorama (1024x512)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 512;
    const sctx = skyCanvas.getContext('2d');

    // Sky gradient
    const skyGrad = sctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.5, '#bae6fd');
    skyGrad.addColorStop(0.85, '#fef3c7');
    skyGrad.addColorStop(1, '#fed7aa');
    sctx.fillStyle = skyGrad;
    sctx.fillRect(0, 0, 1024, 512);

    // Distant city skyline silhouettes
    sctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
    for (let x = 0; x < 1024; x += 32) {
      const bh = 70 + Math.sin(x * 0.05) * 50 + ((x * 19) % 80);
      sctx.fillRect(x, 512 - bh, 28, bh);
    }
    sctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    for (let x = 16; x < 1024; x += 45) {
      const bh = 40 + ((x * 13) % 60);
      sctx.fillRect(x, 512 - bh, 36, bh);
    }

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.wrapS = THREE.RepeatWrapping;
    skyTex.anisotropy = maxAniso;

    return { floorTex, marbleTex, wallTex, artTex, skyTex };
  }

  initLighting() {
    // 1. Soft daylight ambient fill
    const ambientLight = new THREE.AmbientLight(0xfffbf5, 1.05);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // 2. Primary directional sunlight coming through the window facade
    const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.0);
    sunLight.position.set(12, 16, 11);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0002;
    this.scene.add(sunLight);
    this.lights.push(sunLight);

    // 3. Recessed interior ceiling spotlights
    const addCeilingSpot = (x, z, color = 0xfff4df, intensity = 16) => {
      const spot = new THREE.PointLight(color, intensity, 10, 1.8);
      spot.position.set(x, 3.45, z);
      this.scene.add(spot);
      this.lights.push(spot);

      // Glowing LED luminaire lens
      const fixtureGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xfffaea });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(x, 3.58, z);
      this.sceneGroup.add(fixture);

      // Brushed chrome trim ring
      const ringGeo = new THREE.RingGeometry(0.14, 0.20, 16);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, 3.585, z);
      this.sceneGroup.add(ring);
    };

    addCeilingSpot(-1.5, 6.5);  // Reception
    addCeilingSpot(-6.5, 2.5);  // Lounge
    addCeilingSpot(6.5, 2.0);   // Conference
    addCeilingSpot(5.5, -6.5);  // Workstations
    addCeilingSpot(-6.0, -6.5); // Kitchenette
    addCeilingSpot(0.0, 0.0);   // Central corridor
  }

  buildHighFidelityDigitalTwin() {
    const { floorTex, marbleTex, wallTex, artTex, skyTex } = this.textures;

    // --- MATERIALS ---
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.25,
      metalness: 0.05
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9
    });

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      color: 0xfafafa,
      roughness: 0.72,
      metalness: 0.02
    });

    const accentWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.1
    });

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.2
    });

    const architecturalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.92,
      opacity: 0.35,
      transparent: true,
      roughness: 0.04,
      ior: 1.52,
      metalness: 0.08
    });

    const blackFrameMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.25,
      metalness: 0.85
    });

    // --- 1. FLOOR & SOLID CEILING (24m x 20m x 3.6m ceiling) ---
    const floorGeo = new THREE.PlaneGeometry(24, 20);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.sceneGroup.add(floor);
    this.collisionObjects.push(floor);

    // Solid 0.4m thick ceiling slab (bottom face at exactly y = 3.6m)
    const ceilingGeo = new THREE.BoxGeometry(24.5, 0.4, 20.5);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 3.8;
    ceiling.receiveShadow = true;
    ceiling.castShadow = true;
    this.sceneGroup.add(ceiling);
    this.collisionObjects.push(ceiling);

    // --- 2. OUTDOOR CITY SKYLINE BACKDROP (Beyond the 9m glass window) ---
    const skyBackdropGeo = new THREE.PlaneGeometry(36, 14);
    const skyBackdropMat = new THREE.MeshBasicMaterial({ map: skyTex });
    const skyBackdrop = new THREE.Mesh(skyBackdropGeo, skyBackdropMat);
    skyBackdrop.position.set(0, 5.0, 16.0); // Outside South window
    this.sceneGroup.add(skyBackdrop);

    // --- HELPER FUNCTION: ADD DEFINED WALL WITH BASEBOARDS ---
    const addArchitecturalWall = (w, h, d, x, y, z, mat = wallMat, rotateY = 0) => {
      const wallGroup = new THREE.Group();
      wallGroup.position.set(x, y, z);
      wallGroup.rotation.y = rotateY;

      // Main structural wall block
      const wallGeo = new THREE.BoxGeometry(w, h, d);
      const wallMesh = new THREE.Mesh(wallGeo, mat);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallGroup.add(wallMesh);
      this.collisionObjects.push(wallMesh);

      // Baseboard skirting trim (0.12m high)
      const trimH = 0.12;
      const trimD = d + 0.04;
      const baseboardGeo = new THREE.BoxGeometry(w, trimH, trimD);
      const baseboardMesh = new THREE.Mesh(baseboardGeo, baseboardMat);
      baseboardMesh.position.y = -h / 2 + trimH / 2;
      baseboardMesh.castShadow = true;
      baseboardMesh.receiveShadow = true;
      wallGroup.add(baseboardMesh);

      // Top ceiling cornice trim (0.08m high)
      const corniceH = 0.08;
      const corniceGeo = new THREE.BoxGeometry(w, corniceH, trimD);
      const corniceMesh = new THREE.Mesh(corniceGeo, baseboardMat);
      corniceMesh.position.y = h / 2 - corniceH / 2;
      wallGroup.add(corniceMesh);

      this.sceneGroup.add(wallGroup);
      return wallGroup;
    };

    // --- 3. PERIMETER BOUNDARY WALLS ---
    // South Wall (Window facade with daylight)
    addArchitecturalWall(7.5, 3.6, 0.35, -8.25, 1.8, 10);
    addArchitecturalWall(7.5, 3.6, 0.35, 8.25, 1.8, 10);

    // Panoramic 9-meter floor-to-ceiling glass window
    const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.4, 0.06), architecturalGlassMat);
    windowGlass.position.set(0, 1.8, 10);
    this.sceneGroup.add(windowGlass);
    this.collisionObjects.push(windowGlass);

    // Aluminum window frame & mullions
    const addFrame = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), blackFrameMat);
      m.position.set(x, y, z);
      this.sceneGroup.add(m);
    };
    addFrame(9.2, 0.1, 0.25, 0, 0.05, 10);
    addFrame(9.2, 0.1, 0.25, 0, 3.55, 10);
    addFrame(0.1, 3.6, 0.25, -4.5, 1.8, 10);
    addFrame(0.1, 3.6, 0.25, 4.5, 1.8, 10);
    addFrame(0.1, 3.6, 0.25, -1.5, 1.8, 10);
    addFrame(0.1, 3.6, 0.25, 1.5, 1.8, 10);

    // North Wall (Back boundary)
    addArchitecturalWall(24, 3.6, 0.35, 0, 1.8, -10);

    // West Wall (Lounge side)
    addArchitecturalWall(0.35, 3.6, 20, -12, 1.8, 0);

    // East Wall (Conference side)
    addArchitecturalWall(0.35, 3.6, 20, 12, 1.8, 0);

    // --- 4. INTERIOR ARCHITECTURAL PARTITIONS ---
    // Corridor dividers
    addArchitecturalWall(0.35, 3.6, 5.5, 0, 1.8, 7.25);
    addArchitecturalWall(0.35, 3.6, 5.5, 0, 1.8, -7.25);

    // Boardroom / Conference Partition
    addArchitecturalWall(9.5, 3.6, 0.35, 7.25, 1.8, -2.0, accentWallMat);
    const confGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 5.0), architecturalGlassMat);
    confGlass.position.set(2.5, 1.8, 2.5);
    this.sceneGroup.add(confGlass);
    this.collisionObjects.push(confGlass);
    addFrame(0.2, 0.1, 5.2, 2.5, 0.05, 2.5);
    addFrame(0.2, 0.1, 5.2, 2.5, 3.55, 2.5);

    // Lounge Partition
    addArchitecturalWall(9.5, 3.6, 0.35, -7.25, 1.8, -2.0);

    // Modern timber slat divider screen
    const slatMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.35, metalness: 0.1 });
    for (let x = -3.8; x <= -0.4; x += 0.22) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.6, 0.12), slatMat);
      slat.position.set(x, 1.8, 4.5);
      slat.castShadow = true;
      this.sceneGroup.add(slat);
      this.collisionObjects.push(slat);
    }

    // --- 5. DETAILED ARCHITECTURAL FURNITURE ---

    // Reception Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-1.5, 0, 6.8);

    const deskBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.05, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
    );
    deskBase.position.y = 0.525;
    deskBase.castShadow = true;
    deskBase.receiveShadow = true;
    deskGroup.add(deskBase);
    this.collisionObjects.push(deskBase);

    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.08, 0.5),
      new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.15, metalness: 0.1 })
    );
    deskTop.position.set(0, 1.09, -0.32);
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ledStrip.position.set(0, 1.04, -0.05);
    deskGroup.add(ledStrip);
    this.sceneGroup.add(deskGroup);

    // Framed Gallery Art
    const artMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 2.2, 0.08),
      new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.2 })
    );
    artMesh.position.set(-1.5, 2.1, 9.8);
    this.sceneGroup.add(artMesh);

    // Sectional Lounge Sofa
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-6.5, 0, 2.5);

    const sofaFabric = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    const cushionFabric = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });

    const sBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 1.2), sofaFabric);
    sBase.position.set(0, 0.15, 1.4);
    sBase.castShadow = true;
    sofaGroup.add(sBase);
    this.collisionObjects.push(sBase);

    for (let c = -1.1; c <= 1.1; c += 1.1) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 1.0), cushionFabric);
      cushion.position.set(c, 0.41, 1.35);
      cushion.castShadow = true;
      sofaGroup.add(cushion);
    }

    const sBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 0.35), sofaFabric);
    sBack.position.set(0, 0.65, 1.85);
    sBack.castShadow = true;
    sofaGroup.add(sBack);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 1.3), sofaFabric);
    armL.position.set(-1.95, 0.55, 1.4);
    armL.castShadow = true;
    sofaGroup.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 1.3), sofaFabric);
    armR.position.set(1.95, 0.55, 1.4);
    armR.castShadow = true;
    sofaGroup.add(armR);

    // Marble Coffee Table
    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32),
      new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.15, metalness: 0.2 })
    );
    coffeeTable.position.set(0, 0.42, 0.0);
    coffeeTable.castShadow = true;
    sofaGroup.add(coffeeTable);
    this.collisionObjects.push(coffeeTable);

    const legMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI * 2 / 3) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), legMat);
      leg.position.set(Math.cos(a) * 0.65, 0.2, Math.sin(a) * 0.65);
      sofaGroup.add(leg);
    }
    this.sceneGroup.add(sofaGroup);

    // Conference Table Suite
    const confGroup = new THREE.Group();
    confGroup.position.set(7.0, 0, 2.0);

    const confTopMat = new THREE.MeshStandardMaterial({ color: 0x27190e, roughness: 0.15, metalness: 0.1 });
    const confTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 1.9), confTopMat);
    confTop.position.y = 0.75;
    confTop.castShadow = true;
    confGroup.add(confTop);
    this.collisionObjects.push(confTop);

    const pedL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 1.2), confTopMat);
    pedL.position.set(-1.8, 0.35, 0);
    pedL.castShadow = true;
    confGroup.add(pedL);
    const pedR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 1.2), confTopMat);
    pedR.position.set(1.8, 0.35, 0);
    pedR.castShadow = true;
    confGroup.add(pedR);

    // 85-inch Presentation Display Screen
    const tvFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.6, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 })
    );
    tvFrame.position.set(4.8, 2.0, 0);
    confGroup.add(tvFrame);

    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.48, 2.68),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
    );
    tvScreen.position.set(4.74, 2.0, 0);
    confGroup.add(tvScreen);

    // Conference Chairs
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
    for (let x = -1.8; x <= 1.8; x += 0.9) {
      const chairN = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.5), chairMat);
      chairN.position.set(x, 0.425, 1.25);
      chairN.castShadow = true;
      confGroup.add(chairN);
      const chairS = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.5), chairMat);
      chairS.position.set(x, 0.425, -1.25);
      chairS.castShadow = true;
      confGroup.add(chairS);
    }
    this.sceneGroup.add(confGroup);

    // Workstation Pods
    const podGroup = new THREE.Group();
    podGroup.position.set(6.0, 0, -6.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const deskA = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.75, 1.5), deskMat);
    deskA.position.set(0, 0.375, 0.9);
    deskA.castShadow = true;
    podGroup.add(deskA);
    this.collisionObjects.push(deskA);

    const deskB = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.75, 1.5), deskMat);
    deskB.position.set(0, 0.375, -0.9);
    deskB.castShadow = true;
    podGroup.add(deskB);
    this.collisionObjects.push(deskB);

    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.45, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 })
    );
    divider.position.set(0, 0.98, 0);
    podGroup.add(divider);
    this.sceneGroup.add(podGroup);

    // Botanical Potted Plants
    const addPlant = (x, z) => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.20, 0.55, 24),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
      );
      pot.position.set(x, 0.275, z);
      pot.castShadow = true;
      this.sceneGroup.add(pot);
      this.collisionObjects.push(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
      for (let l = 0; l < 5; l++) {
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), leafMat);
        leaf.position.set(x + (Math.random() - 0.5) * 0.2, 0.75 + l * 0.15, z + (Math.random() - 0.5) * 0.2);
        leaf.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        leaf.castShadow = true;
        this.sceneGroup.add(leaf);
      }
    };

    addPlant(-0.8, 4.5);
    addPlant(0.8, 4.5);
    addPlant(-11.0, 9.0);
    addPlant(11.0, 9.0);
    addPlant(11.0, -9.0);
    addPlant(-11.0, -9.0);
  }

  // Load external user-provided GLB / GLTF 3D model
  loadGLTF(url, onProgress, onComplete, onError) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            this.collisionObjects.push(child);
          }
        });
        this.sceneGroup.clear();
        this.sceneGroup.add(root);
        if (onComplete) onComplete(root);
      },
      onProgress,
      onError
    );
  }
}
