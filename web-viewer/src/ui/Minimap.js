export class Minimap {
  constructor(canvasId, coordsElementId) {
    this.canvas = document.getElementById(canvasId);
    this.coordsEl = document.getElementById(coordsElementId);
    this.ctx = this.canvas.getContext('2d');

    // World to minimap scaling
    // World space bounds: x: -12 to +12 (width 24m), z: -10 to +10 (depth 20m)
    this.worldWidth = 26;
    this.worldDepth = 22;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  worldToCanvas(x, z) {
    const cx = ((x + this.worldWidth / 2) / this.worldWidth) * this.width;
    const cz = ((z + this.worldDepth / 2) / this.worldDepth) * this.height;
    return { x: cx, y: cz };
  }

  update(playerPosition, playerRotationY) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid background
    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = this.width / 8;
    for (let x = 0; x < this.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 2. Outer architectural perimeter walls
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    const tl = this.worldToCanvas(-12, -10);
    const br = this.worldToCanvas(12, 10);
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

    // 3. Interior partitions
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;

    const drawLine = (x1, z1, x2, z2) => {
      const p1 = this.worldToCanvas(x1, z1);
      const p2 = this.worldToCanvas(x2, z2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    // Central partitions with door corridors
    drawLine(0, 10, 0, 4.5);
    drawLine(0, -4.5, 0, -10);
    drawLine(2.5, -2, 12, -2);
    drawLine(-2.5, -2, -12, -2);

    // 4. Draw Player Position & Directional FOV Vision Cone
    const playerCanvas = this.worldToCanvas(playerPosition.x, playerPosition.z);

    const fovRadius = 26;
    const fovAngle = Math.PI / 4; // 45 deg FOV
    const angle = playerRotationY + Math.PI / 2;

    // Soft vision cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    ctx.moveTo(playerCanvas.x, playerCanvas.y);
    ctx.arc(playerCanvas.x, playerCanvas.y, fovRadius, angle - fovAngle / 2, angle + fovAngle / 2);
    ctx.closePath();
    ctx.fill();

    // Direction arrow pointer
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerCanvas.x, playerCanvas.y);
    ctx.lineTo(
      playerCanvas.x + Math.cos(angle) * 12,
      playerCanvas.y + Math.sin(angle) * 12
    );
    ctx.stroke();

    // Player location dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(playerCanvas.x, playerCanvas.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Update coordinate display
    if (this.coordsEl) {
      this.coordsEl.innerText = `X: ${playerPosition.x.toFixed(1)}m | Z: ${playerPosition.z.toFixed(1)}m`;
    }
  }
}
