export class HUD {
  constructor({
    onModeChange,
    onStartWalk,
    onStartTour,
    onTourPause,
    onModelDrop
  }) {
    this.onModeChange = onModeChange;
    this.onStartWalk = onStartWalk;
    this.onStartTour = onStartTour;
    this.onTourPause = onTourPause;
    this.onModelDrop = onModelDrop;

    this.activeMode = 'fps'; // 'fps' | 'tour' | 'orbit'
    this.fpsCounter = document.getElementById('fps-counter');
    this.blocker = document.getElementById('blocker');
    this.crosshair = document.getElementById('crosshair');
    this.helpModal = document.getElementById('help-modal');
    this.studioModal = document.getElementById('upload-tutorial-modal');
    this.tourHud = document.getElementById('tour-hud');
    this.tourZoneName = document.getElementById('tour-zone-name');
    this.btnTourPause = document.getElementById('btn-tour-pause');

    this.frameCount = 0;
    this.lastFpsTime = performance.now();

    this.initEventListeners();
    this.initStudioTabs();
    this.initDragAndDrop();
  }

  initEventListeners() {
    // Mode switcher buttons
    const btnFps = document.getElementById('btn-mode-fps');
    const btnTour = document.getElementById('btn-mode-tour');
    const btnOrbit = document.getElementById('btn-mode-orbit');

    btnFps.addEventListener('click', () => this.setMode('fps'));
    if (btnTour) btnTour.addEventListener('click', () => this.setMode('tour'));
    btnOrbit.addEventListener('click', () => this.setMode('orbit'));

    // Welcome screen action buttons
    const btnStart = document.getElementById('btn-start-walk');
    btnStart.addEventListener('click', () => {
      if (this.onStartWalk) this.onStartWalk();
    });

    const btnStartTour = document.getElementById('btn-start-tour');
    if (btnStartTour) {
      btnStartTour.addEventListener('click', () => {
        this.setMode('tour');
      });
    }

    // Tour HUD action buttons
    if (this.btnTourPause) {
      this.btnTourPause.addEventListener('click', () => {
        if (this.onTourPause) {
          const isPaused = this.onTourPause();
          this.btnTourPause.innerText = isPaused ? 'Resume' : 'Pause';
        }
      });
    }

    const btnTourExit = document.getElementById('btn-tour-exit');
    if (btnTourExit) {
      btnTourExit.addEventListener('click', () => {
        this.setMode('fps');
      });
    }

    // Help Modal
    const btnHelp = document.getElementById('btn-help-toggle');
    const btnCloseHelp = document.getElementById('btn-close-help');
    btnHelp.addEventListener('click', () => this.helpModal.classList.remove('hidden'));
    btnCloseHelp.addEventListener('click', () => this.helpModal.classList.add('hidden'));

    // Studio & Tutorial Modal Toggle
    const btnStudio = document.getElementById('btn-upload-tutorial');
    const btnStudioCard = document.getElementById('btn-open-studio-card');
    const btnCloseStudio = document.getElementById('btn-close-studio');

    const openStudio = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.studioModal.classList.remove('hidden');
    };

    if (btnStudio) btnStudio.addEventListener('click', openStudio);
    if (btnStudioCard) btnStudioCard.addEventListener('click', openStudio);

    if (btnCloseStudio) {
      btnCloseStudio.addEventListener('click', (e) => {
        e.stopPropagation();
        this.studioModal.classList.add('hidden');
      });
    }

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyV') {
        const nextMode = this.activeMode === 'fps' ? 'orbit' : (this.activeMode === 'orbit' ? 'tour' : 'fps');
        this.setMode(nextMode);
      } else if (e.code === 'KeyM') {
        const minimap = document.getElementById('minimap-panel');
        minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
      } else if (e.code === 'Escape') {
        this.helpModal.classList.add('hidden');
        this.studioModal.classList.add('hidden');
        if (this.activeMode === 'tour') {
          this.setMode('fps');
        }
      }
    });
  }

  initStudioTabs() {
    const tabUpload = document.getElementById('tab-btn-upload');
    const tabTutorial = document.getElementById('tab-btn-tutorial');

    const contentUpload = document.getElementById('tab-content-upload');
    const contentTutorial = document.getElementById('tab-content-tutorial');

    const selectTab = (btn, content) => {
      [tabUpload, tabTutorial].forEach(b => b.classList.remove('active'));
      [contentUpload, contentTutorial].forEach(c => c.classList.add('hidden'));
      btn.classList.add('active');
      content.classList.remove('hidden');
    };

    tabUpload.addEventListener('click', () => selectTab(tabUpload, contentUpload));
    tabTutorial.addEventListener('click', () => selectTab(tabTutorial, contentTutorial));

    // File input picker
    const fileInput = document.getElementById('studio-file-input');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleResourceUpload(e.target.files[0]);
      }
    });
  }

  initDragAndDrop() {
    const dropzone = document.getElementById('modal-dropzone');

    ['dragenter', 'dragover'].forEach(eventName => {
      window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropzone) dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropzone) dropzone.classList.remove('dragover');
      });
    });

    window.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleResourceUpload(files[0]);
      }
    });
  }

  handleResourceUpload(file) {
    const filename = file.name.toLowerCase();
    const is3DModel = filename.endsWith('.glb') || filename.endsWith('.gltf');
    const isVideo = filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.mkv');

    if (is3DModel) {
      const progressBox = document.getElementById('pipeline-progress-box');
      const progressBar = document.getElementById('studio-progress-bar');
      const statusText = document.getElementById('pipeline-status-text');

      if (progressBox) progressBox.classList.remove('hidden');
      if (statusText) statusText.innerText = `Loading 3D model ${file.name}...`;
      if (progressBar) progressBar.style.width = '60%';

      const url = URL.createObjectURL(file);
      setTimeout(() => {
        if (this.onModelDrop) {
          this.onModelDrop(url, file.name);
        }
        if (progressBar) progressBar.style.width = '100%';
        if (statusText) statusText.innerText = 'Render Complete! Launching Walkthrough...';
        setTimeout(() => {
          this.studioModal.classList.add('hidden');
          if (progressBox) progressBox.classList.add('hidden');
        }, 500);
      }, 400);

    } else if (isVideo) {
      alert(`Smartphone video "${file.name}" detected! To run the automated 3D reconstruction pipeline on this video, run:\n\npython pipeline/pipeline_runner.py --video "${file.name}"\n\nThe pipeline will extract blur-filtered keyframes, solve SfM poses, and output web-ready digital twin assets.`);
    } else {
      alert('Please upload a .glb / .gltf 3D model or a .mp4 / .mov smartphone capture video.');
    }
  }

  setMode(mode) {
    this.activeMode = mode;
    const btnFps = document.getElementById('btn-mode-fps');
    const btnTour = document.getElementById('btn-mode-tour');
    const btnOrbit = document.getElementById('btn-mode-orbit');

    [btnFps, btnTour, btnOrbit].forEach(b => {
      if (b) b.classList.remove('active');
    });

    if (mode === 'fps') {
      if (btnFps) btnFps.classList.add('active');
      this.crosshair.style.display = 'block';
      if (this.tourHud) this.tourHud.classList.add('hidden');
    } else if (mode === 'tour') {
      if (btnTour) btnTour.classList.add('active');
      this.crosshair.style.display = 'none';
      this.hideBlocker();
      if (this.tourHud) this.tourHud.classList.remove('hidden');
    } else {
      if (btnOrbit) btnOrbit.classList.add('active');
      this.crosshair.style.display = 'none';
      this.hideBlocker();
      if (this.tourHud) this.tourHud.classList.add('hidden');
    }

    if (this.onModeChange) {
      this.onModeChange(mode);
    }
  }

  setTourZone(zoneName) {
    if (this.tourZoneName) {
      this.tourZoneName.innerText = zoneName;
    }
  }

  showBlocker() {
    if (this.activeMode === 'fps') {
      this.blocker.classList.remove('hidden');
    }
  }

  hideBlocker() {
    this.blocker.classList.add('hidden');
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      if (this.fpsCounter) {
        this.fpsCounter.innerText = `${fps} FPS`;
      }
      this.frameCount = 0;
      this.lastFpsTime = now;
    }
  }
}
