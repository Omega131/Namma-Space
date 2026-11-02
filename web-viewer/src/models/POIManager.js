import * as THREE from 'three';

export class POIManager {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.pois = [];
    this.poiMeshes = [];
    this.markerGroup = new THREE.Group();
    this.scene.add(this.markerGroup);

    this.hoveredPOI = null;
    this.initDefaultPOIs();
  }

  initDefaultPOIs() {
    const defaultData = [
      {
        id: 'poi-reception',
        title: 'Welcome & Reception Lobby',
        category: 'Lobby',
        position: new THREE.Vector3(-1.5, 0.0, 7.0),
        markerHeight: 1.8,
        description: 'Main greeting counter equipped with visitor registration kiosk, brochure display, and check-in terminal.',
        tags: ['reception', 'entrance', 'lobby', 'checkin', 'desk']
      },
      {
        id: 'poi-lounge',
        title: 'Executive Breakout Lounge',
        category: 'Lounge',
        position: new THREE.Vector3(-6.5, 0.0, 2.5),
        markerHeight: 1.8,
        description: 'Comfortable collaborative seating zone featuring modern velvet armchairs, marble coffee tables, and warm recessed downlights.',
        tags: ['lounge', 'sofa', 'breakout', 'coffee', 'casual', 'chairs']
      },
      {
        id: 'poi-conference',
        title: 'Boardroom / Conference Room A',
        category: 'Conference',
        position: new THREE.Vector3(6.5, 0.0, 2.0),
        markerHeight: 1.8,
        description: '10-person acoustically treated meeting room with 85-inch 4K teleconference display, conference webcam, and ergonomic chairs.',
        tags: ['conference', 'meeting', 'boardroom', 'presentation', 'screen', 'tv']
      },
      {
        id: 'poi-workstations',
        title: 'Engineering Workstation Pods',
        category: 'Workspace',
        position: new THREE.Vector3(5.5, 0.0, -6.5),
        markerHeight: 1.8,
        description: 'Dual-monitor height-adjustable sit-stand workstations for engineering and spatial research teams.',
        tags: ['desk', 'workstation', 'office', 'computer', 'monitors', 'tech']
      },
      {
        id: 'poi-kitchenette',
        title: 'Pantry & Coffee Bar',
        category: 'Utility',
        position: new THREE.Vector3(-6.0, 0.0, -6.5),
        markerHeight: 1.8,
        description: 'Espresso machine, refrigerator, water purification station, and snack storage bar.',
        tags: ['kitchen', 'pantry', 'coffee', 'water', 'food', 'tea']
      },
      {
        id: 'poi-emergency',
        title: 'Emergency Stairwell & Exit',
        category: 'Safety',
        position: new THREE.Vector3(0.0, 0.0, -9.0),
        markerHeight: 1.8,
        description: 'Direct fire-rated egress route with illuminated emergency signage and first-aid station.',
        tags: ['exit', 'stairs', 'emergency', 'fire', 'safety']
      }
    ];

    defaultData.forEach(poi => this.addPOI(poi));
  }

  createMarkerMesh(poi) {
    const marker = new THREE.Group();
    marker.position.copy(poi.position);
    marker.position.y += poi.markerHeight || 1.8;

    // Glowing sphere top
    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 0.25;
    marker.add(sphere);

    // Inverted cone pin
    const coneGeo = new THREE.ConeGeometry(0.14, 0.35, 16);
    coneGeo.rotateX(Math.PI); // Point down
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.3,
      metalness: 0.5
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    marker.add(cone);

    // Outer pulsing halo ring
    const ringGeo = new THREE.RingGeometry(0.24, 0.32, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -0.15;
    marker.add(ring);

    // Ground projection circle
    const groundRingGeo = new THREE.RingGeometry(0.35, 0.45, 24);
    groundRingGeo.rotateX(-Math.PI / 2);
    const groundRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
    groundRing.position.set(0, -(poi.markerHeight || 1.8) + 0.02, 0);
    marker.add(groundRing);

    // Store references for animation & raycasting
    marker.userData = {
      poiId: poi.id,
      baseY: marker.position.y,
      sphereMat,
      ringMat,
      groundRing
    };

    return marker;
  }

  addPOI(poiData) {
    this.pois.push(poiData);
    const mesh = this.createMarkerMesh(poiData);
    this.poiMeshes.push(mesh);
    this.markerGroup.add(mesh);
  }

  getAllPOIs() {
    return this.pois;
  }

  getPOIById(id) {
    return this.pois.find(p => p.id === id);
  }

  searchPOIs(query) {
    if (!query) return this.pois;
    const q = query.toLowerCase().trim();
    return this.pois.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  raycast(raycaster) {
    // Intersect marker children
    const intersects = raycaster.intersectObjects(this.markerGroup.children, true);
    if (intersects.length > 0) {
      // Traverse up to find group with userData.poiId
      let obj = intersects[0].object;
      while (obj && (!obj.userData || !obj.userData.poiId)) {
        obj = obj.parent;
      }
      if (obj && obj.userData && obj.userData.poiId) {
        return this.getPOIById(obj.userData.poiId);
      }
    }
    return null;
  }

  update(time) {
    // Animate hovering and pulsing
    const pulse = Math.sin(time * 3.5) * 0.5 + 0.5;
    const bob = Math.sin(time * 2.5) * 0.08;

    this.poiMeshes.forEach(marker => {
      marker.position.y = marker.userData.baseY + bob;
      marker.rotation.y = time * 0.8;

      if (marker.userData.ringMat) {
        marker.userData.ringMat.opacity = 0.3 + pulse * 0.5;
      }
      if (marker.userData.sphereMat) {
        marker.userData.sphereMat.emissiveIntensity = 0.6 + pulse * 0.6;
      }
    });
  }
}

