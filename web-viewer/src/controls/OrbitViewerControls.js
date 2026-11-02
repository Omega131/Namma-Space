import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class OrbitViewerControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.controls = new OrbitControls(camera, domElement);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent dipping beneath floor
    this.controls.target.set(0, 1.2, 0);

    this.enabled = false;
    this.controls.enabled = false;
  }

  enable(focusPoint = null) {
    this.enabled = true;
    this.controls.enabled = true;
    if (focusPoint) {
      this.controls.target.copy(focusPoint);
    }
  }

  disable() {
    this.enabled = false;
    this.controls.enabled = false;
  }

  update() {
    if (this.enabled) {
      this.controls.update();
    }
  }
}

