import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { OrbitViewerControls } from './controls/OrbitViewerControls.js';
import { CinematicTour } from './controls/CinematicTour.js';
import { IndoorScene } from './models/IndoorScene.js';
import { Minimap } from './ui/Minimap.js';
import { HUD } from './ui/HUD.js';

class SpatialViewerApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.currentMode = 'fps'; // 'fps' | 'tour' | 'orbit'

    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initScene();
    this.initCameras();
    this.initControls();
    this.initUI();
    this.initResize();

    // Check URL parameters for custom startup options
    this.checkUrlParams();

    // Fade out loading screen
    setTimeout(() => {
      this.hud.hideLoadingScreen();
    }, 600);

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e131f);
    this.scene.fog = new THREE.FogExp2(0x0e131f, 0.012);

    // Photorealistic Studio Room Environment for PBR specular reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // Architectural digital twin space with max anisotropic textures
    this.indoorScene = new IndoorScene(this.scene, this.renderer);
  }

  initCameras() {
    const aspect = window.innerWidth / window.innerHeight;

    // 1. First-Person Camera (shared with cinematic tour)
    this.fpsCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
    this.fpsCamera.position.set(0, 1.7, 8.5); // Spawn in Reception Foyer

    // 2. Dollhouse / Orbit Camera
    this.orbitCamera = new THREE.PerspectiveCamera(48, aspect, 0.1, 200);
    this.orbitCamera.position.set(0, 22, 24);
    this.orbitCamera.lookAt(0, 0, 0);

    this.activeCamera = this.fpsCamera;
  }

  initControls() {
    // First-Person Controls with multi-raycast wall sliding collision
    this.fpsControls = new FirstPersonControls(
      this.fpsCamera,
      document.body,
      this.indoorScene.collisionObjects
    );

    // Orbit Controls for Dollhouse view
    this.orbitControls = new OrbitViewerControls(
      this.orbitCamera,
      this.renderer.domElement
    );

    // Automated Cinematic Video Walkthrough Tour
    this.cinematicTour = new CinematicTour(
      this.fpsCamera,
      (zoneName) => {
        if (this.hud) this.hud.setTourZone(zoneName);
      }
    );

    // PointerLock state synchronization
    this.fpsControls.controls.addEventListener('lock', () => {
      if (this.currentMode === 'fps') {
        this.hud.hideBlocker();
      }
    });

    this.fpsControls.controls.addEventListener('unlock', () => {
      if (this.currentMode === 'fps') {
        this.hud.showBlocker();
      }
    });
  }

  initUI() {
    this.minimap = new Minimap('minimap-canvas', 'player-coords');

    this.hud = new HUD({
      onModeChange: (mode) => this.switchMode(mode),
      onStartWalk: () => this.fpsControls.lock(),
      onStartTour: () => this.switchMode('tour'),
      onTourPause: () => this.cinematicTour.togglePause(),
      onModelDrop: (url, filename) => this.loadCustomModel(url, filename)
    });
  }

  switchMode(mode) {
    this.currentMode = mode;

    if (mode === 'fps') {
      this.activeCamera = this.fpsCamera;
      this.cinematicTour.stop();
      this.orbitControls.disable();
      this.fpsControls.enabled = true;
      this.fpsControls.lock();
    } else if (mode === 'tour') {
      this.activeCamera = this.fpsCamera;
      this.fpsControls.unlock();
      this.fpsControls.enabled = false;
      this.orbitControls.disable();
      this.cinematicTour.start();
    } else { // orbit
      this.activeCamera = this.orbitCamera;
      this.cinematicTour.stop();
      this.fpsControls.unlock();
      this.fpsControls.enabled = false;
      this.orbitControls.enable(new THREE.Vector3(0, 1.2, 0));
    }
  }

  loadCustomModel(url, filename) {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    loadingText.innerText = `Importing ${filename}...`;
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('fade-out');

    this.indoorScene.loadGLTF(
      url,
      (progress) => {
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          document.getElementById('progress-bar').style.width = `${pct}%`;
        }
      },
      (root) => {
        this.fpsControls.setCollisionObjects(this.indoorScene.collisionObjects);
        setTimeout(() => this.hud.hideLoadingScreen(), 400);
      },
      (err) => {
        console.error('Failed to load model:', err);
        alert('Could not load custom 3D model.');
        this.hud.hideLoadingScreen();
      }
    );
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'orbit') {
      this.switchMode('orbit');
      this.hud.setMode('orbit');
    } else if (params.get('mode') === 'tour') {
      this.switchMode('tour');
      this.hud.setMode('tour');
    }
    const modelParam = params.get('model');
    if (modelParam) {
      this.loadCustomModel(modelParam, modelParam.split('/').pop());
    }
  }

  initResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;

      this.fpsCamera.aspect = aspect;
      this.fpsCamera.updateProjectionMatrix();

      this.orbitCamera.aspect = aspect;
      this.orbitCamera.updateProjectionMatrix();

      this.renderer.setSize(w, h);
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

      if (this.currentMode === 'tour') {
        this.cinematicTour.update(delta);
      } else if (this.currentMode === 'fps') {
        this.fpsControls.update(delta);
      } else {
        this.orbitControls.update();
      }

      // Update Minimap radar
      const playerPos = this.activeCamera.position;
      const playerRotY = this.activeCamera.rotation.y;
      this.minimap.update(playerPos, playerRotY);

      // Render 3D Scene
      this.renderer.render(this.scene, this.activeCamera);

      // Track FPS
      this.hud.updateFPS();
    }
  }

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new SpatialViewerApp();
});
