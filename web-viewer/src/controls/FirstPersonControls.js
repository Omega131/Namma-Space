import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class FirstPersonControls {
  constructor(camera, domElement, collisionObjects = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.collisionObjects = collisionObjects;

    this.controls = new PointerLockControls(camera, domElement);

    // Kinematic movement states
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.canJump = true;

    this.velocity = new THREE.Vector3();

    // Human dimensions & locomotion physics
    this.playerHeight = 1.7;        // 1.7m eye level
    this.playerRadius = 0.35;       // Collision cylinder radius
    this.walkSpeed = 42.0;          // Smooth walk acceleration
    this.sprintSpeed = 78.0;        // Sprint acceleration
    this.friction = 14.0;           // Crisp, responsive deceleration (no ice-skating)
    this.jumpForce = 7.2;           // Realistic human jump height (~0.7m)
    this.gravity = 26.0;            // Ground gravity

    // Head bobbing kinematics
    this.bobTimer = 0;
    this.bobFrequency = 9.5;
    this.bobAmplitude = 0.025;
    this.baseCameraY = this.playerHeight;
    this.maxCeilingEyeY = 3.32;     // Solid ceiling clamp (below 3.6m ceiling)

    // Dedicated raycasters for 3D collision physics
    this.rayFloor = new THREE.Raycaster();
    this.rayFloor.ray.direction.set(0, -1, 0);

    this.rayCeiling = new THREE.Raycaster();
    this.rayCeiling.ray.direction.set(0, 1, 0);

    this.rayWall = new THREE.Raycaster();

    this.enabled = true;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const onKeyDown = (event) => {
      if (!this.enabled || !this.controls.isLocked) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
        case 'Space':
          if (this.canJump) {
            this.velocity.y = this.jumpForce;
            this.canJump = false;
          }
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  setCollisionObjects(objects) {
    this.collisionObjects = objects;
  }

  isLocked() {
    return this.controls.isLocked;
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }

  teleport(position, lookAtTarget = null) {
    this.camera.position.set(position.x, position.y + this.playerHeight, position.z);
    this.velocity.set(0, 0, 0);
    this.baseCameraY = position.y + this.playerHeight;
    if (lookAtTarget) {
      this.camera.lookAt(lookAtTarget.x, lookAtTarget.y || position.y + this.playerHeight, lookAtTarget.z);
    }
  }

  // Tests collision along a world movement vector and calculates wall slide
  testMovementWithSliding(origin, moveVector, currentDisplacement) {
    if (this.collisionObjects.length === 0 || moveVector.lengthSq() < 0.00001) {
      return moveVector;
    }

    const testDir = moveVector.clone().normalize();
    const distanceToTest = Math.max(0.45, currentDisplacement + this.playerRadius);

    // Multi-height test (waist and knee levels)
    const testHeights = [0.6, 1.1];
    let closestHit = null;

    for (const hOffset of testHeights) {
      const probeOrigin = origin.clone();
      probeOrigin.y -= hOffset;

      this.rayWall.set(probeOrigin, testDir);
      const hits = this.rayWall.intersectObjects(this.collisionObjects, true);

      if (hits.length > 0 && hits[0].distance < distanceToTest) {
        if (!closestHit || hits[0].distance < closestHit.distance) {
          closestHit = hits[0];
        }
      }
    }

    if (!closestHit) {
      // Path is completely clear
      return moveVector;
    }

    // Hit a surface: compute wall slide vector
    if (closestHit.face) {
      const worldNormal = closestHit.face.normal.clone();
      worldNormal.transformDirection(closestHit.object.matrixWorld);
      worldNormal.y = 0; // Keep horizontal

      if (worldNormal.lengthSq() > 0.01) {
        worldNormal.normalize();
        // Project movement along wall: v_slide = v - (v . n) * n
        const dot = moveVector.dot(worldNormal);
        if (dot < 0) { // Only deflect if moving into the wall
          const slide = moveVector.clone().sub(worldNormal.multiplyScalar(dot));
          return slide;
        }
      }
    }

    // If completely perpendicular head-on collision, nullify
    return new THREE.Vector3(0, 0, 0);
  }

  update(delta) {
    if (!this.enabled || !this.controls.isLocked) return;

    delta = Math.min(delta, 0.06); // Prevent tunneling on lag

    // 1. Deceleration / Friction
    this.velocity.x -= this.velocity.x * this.friction * delta;
    this.velocity.z -= this.velocity.z * this.friction * delta;

    // 2. Gravity
    this.velocity.y -= this.gravity * delta;

    // 3. User Input Direction
    // W = +1 (forward), S = -1 (backward)
    // D = +1 (right), A = -1 (left)
    const forwardInput = Number(this.moveForward) - Number(this.moveBackward);
    const rightInput = Number(this.moveRight) - Number(this.moveLeft);

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (forwardInput !== 0 || rightInput !== 0) {
      const inputVec = new THREE.Vector2(rightInput, forwardInput).normalize();
      this.velocity.z += inputVec.y * currentSpeed * delta;
      this.velocity.x += inputVec.x * currentSpeed * delta;
    }

    // 4. Compute World Displacement with Wall Sliding
    const forwardDir = new THREE.Vector3();
    this.camera.getWorldDirection(forwardDir);
    forwardDir.y = 0;
    forwardDir.normalize();

    const rightDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x).normalize();

    // Desired horizontal world displacement
    const moveWorld = new THREE.Vector3()
      .addScaledVector(forwardDir, this.velocity.z * delta)
      .addScaledVector(rightDir, this.velocity.x * delta);

    const playerPos = this.camera.position.clone();
    playerPos.y = this.baseCameraY;

    // Apply collision sliding
    const finalMove = this.testMovementWithSliding(playerPos, moveWorld, moveWorld.length());

    // Translate camera by resolved vector
    this.camera.position.add(finalMove);

    // 5. Vertical Kinematics & Solid Ceiling Check
    this.baseCameraY += this.velocity.y * delta;

    if (this.velocity.y > 0) {
      // Upward ceiling collision
      if (this.collisionObjects.length > 0) {
        const headOrigin = this.camera.position.clone();
        headOrigin.y = this.baseCameraY;
        this.rayCeiling.set(headOrigin, new THREE.Vector3(0, 1, 0));
        const ceilingHits = this.rayCeiling.intersectObjects(this.collisionObjects, true);

        if (ceilingHits.length > 0 && ceilingHits[0].distance < 0.22) {
          this.velocity.y = 0; // Bonk head and drop down
          this.baseCameraY = ceilingHits[0].point.y - 0.22;
        }
      }

      // Hard safety ceiling clamp
      if (this.baseCameraY > this.maxCeilingEyeY) {
        this.baseCameraY = this.maxCeilingEyeY;
        this.velocity.y = 0;
      }
    }

    // 6. Downward Floor Collision & Ground Clamping
    if (this.collisionObjects.length > 0) {
      const rayOrigin = this.camera.position.clone();
      rayOrigin.y = this.baseCameraY + 0.4; // Start above head
      this.rayFloor.set(rayOrigin, new THREE.Vector3(0, -1, 0));
      const floorHits = this.rayFloor.intersectObjects(this.collisionObjects, true);

      if (floorHits.length > 0) {
        const floorY = floorHits[0].point.y;
        const targetEyeY = floorY + this.playerHeight;
        if (this.baseCameraY <= targetEyeY) {
          this.velocity.y = 0;
          this.baseCameraY = targetEyeY;
          this.canJump = true;
        }
      } else {
        if (this.baseCameraY <= this.playerHeight) {
          this.velocity.y = 0;
          this.baseCameraY = this.playerHeight;
          this.canJump = true;
        }
      }
    } else {
      if (this.baseCameraY <= this.playerHeight) {
        this.velocity.y = 0;
        this.baseCameraY = this.playerHeight;
        this.canJump = true;
      }
    }

    // 7. Walking Head-Bobbing
    const isWalking = (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) && this.canJump;
    if (isWalking) {
      const speedFactor = this.isSprinting ? 1.35 : 1.0;
      this.bobTimer += delta * this.bobFrequency * speedFactor;
      const bobOffset = Math.sin(this.bobTimer) * this.bobAmplitude;
      this.camera.position.y = this.baseCameraY + bobOffset;
    } else {
      this.bobTimer = 0;
      this.camera.position.y = this.baseCameraY;
    }
  }
}
