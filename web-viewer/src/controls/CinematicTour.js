import * as THREE from 'three';

export class CinematicTour {
  constructor(camera, onZoneChange) {
    this.camera = camera;
    this.onZoneChange = onZoneChange;
    this.isPlaying = false;
    this.isPaused = false;
    this.progress = 0; // 0.0 to 1.0
    this.duration = 42.0; // 42 seconds complete architectural tour

    this.initPath();
  }

  initPath() {
    // 3D Spline trajectory through the architectural digital twin (at 1.7m eye-level)
    this.waypoints = [
      { pos: new THREE.Vector3(0.0, 1.7, 8.5), look: new THREE.Vector3(0.0, 1.7, 5.0), zone: 'Welcome Reception & Foyer' },
      { pos: new THREE.Vector3(-1.5, 1.7, 6.2), look: new THREE.Vector3(-1.5, 1.3, 7.5), zone: 'Reception Desk & Accent Art' },
      { pos: new THREE.Vector3(-2.8, 1.7, 4.2), look: new THREE.Vector3(-4.5, 1.5, 3.5), zone: 'Timber Slat Divider Screen' },
      { pos: new THREE.Vector3(-6.5, 1.7, 3.2), look: new THREE.Vector3(-6.5, 1.2, 1.5), zone: 'Executive Breakout Lounge' },
      { pos: new THREE.Vector3(-6.5, 1.7, 1.0), look: new THREE.Vector3(-4.0, 1.4, 0.5), zone: 'Lounge Coffee Table Suite' },
      { pos: new THREE.Vector3(0.0, 1.7, 1.5), look: new THREE.Vector3(3.5, 1.6, 2.0), zone: 'Central Architectural Corridor' },
      { pos: new THREE.Vector3(4.0, 1.7, 2.0), look: new THREE.Vector3(7.0, 1.4, 2.0), zone: 'Boardroom Acoustic Glass Portal' },
      { pos: new THREE.Vector3(7.0, 1.7, 2.0), look: new THREE.Vector3(11.5, 1.8, 2.0), zone: 'Boardroom & 85-inch Presentation Display' },
      { pos: new THREE.Vector3(6.5, 1.7, -2.5), look: new THREE.Vector3(6.0, 1.4, -6.0), zone: 'Engineering Wing Transition' },
      { pos: new THREE.Vector3(6.0, 1.7, -6.5), look: new THREE.Vector3(3.0, 1.4, -6.5), zone: 'Workstation Pods & Dual Displays' },
      { pos: new THREE.Vector3(0.0, 1.7, -6.5), look: new THREE.Vector3(0.0, 1.7, 0.0), zone: 'Rear Corridor & Egress Access' },
      { pos: new THREE.Vector3(0.0, 1.7, 2.0), look: new THREE.Vector3(0.0, 1.7, 9.5), zone: 'Panoramic 9m Glass Window Facade' },
      { pos: new THREE.Vector3(0.0, 1.7, 8.5), look: new THREE.Vector3(0.0, 1.7, 5.0), zone: 'Welcome Reception & Foyer' }
    ];

    const points = this.waypoints.map(w => w.pos);
    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.currentZone = '';
  }

  start() {
    this.isPlaying = true;
    this.isPaused = false;
    this.progress = 0;
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  update(delta) {
    if (!this.isPlaying || this.isPaused) return;

    delta = Math.min(delta, 0.08);
    this.progress += delta / this.duration;

    if (this.progress >= 1.0) {
      this.progress = 0.0; // Loop seamlessly
    }

    // Interpolated camera position
    const camPos = this.curve.getPointAt(this.progress);
    this.camera.position.copy(camPos);

    // Look-ahead tangent vector
    const tangent = this.curve.getTangentAt(this.progress).normalize();
    const lookTarget = camPos.clone().add(tangent.multiplyScalar(4.0));
    this.camera.lookAt(lookTarget);

    // Determine current zone based on progress
    const zoneIdx = Math.floor(this.progress * (this.waypoints.length - 1));
    const activeZone = this.waypoints[zoneIdx].zone;
    if (activeZone !== this.currentZone) {
      this.currentZone = activeZone;
      if (this.onZoneChange) {
        this.onZoneChange(activeZone, this.progress);
      }
    }
  }
}

