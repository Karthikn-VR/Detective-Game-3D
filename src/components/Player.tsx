import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';

const COLLISION_WALLS = [
  // Room boundaries [minX, maxX, minZ, maxZ] - expanded slightly
  { minX: -3.2, maxX: 3.2, minZ: -2.8, maxZ: 2.8 },
];

const COLLISION_OBSTACLES = [
  // Desk area - slightly narrower to allow passage
  { x: 0, z: -0.5, w: 2.0, d: 1.0 },
  // Bookshelf
  { x: -2.1, z: 0.5, w: 0.6, d: 0.3 },
  // Cabinets
  { x: 2.4, z: -1.8, w: 0.8, d: 0.5 },
];

// Simple Touch Joystick component for Mobile
function Joystick({ onMove }: { onMove: (dir: THREE.Vector3) => void }) {
  const [touching, setTouching] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);

  const handleTouch = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2;
    
    if (dist > maxDist) {
      dx *= maxDist / dist;
      dy *= maxDist / dist;
    }

    setPos({ x: dx, y: dy });
    onMove(new THREE.Vector3(dx / maxDist, 0, dy / maxDist));
  }, [onMove]);

  return (
    <div 
      className="fixed bottom-12 left-12 w-32 h-32 z-50 pointer-events-auto md:hidden joystick-container"
      onMouseDown={() => setTouching(true)}
      onTouchStart={() => setTouching(true)}
      onMouseMove={(e) => touching && handleTouch(e)}
      onTouchMove={(e) => touching && handleTouch(e)}
      onMouseUp={() => { setTouching(false); setPos({ x: 0, y: 0 }); onMove(new THREE.Vector3()); }}
      onTouchEnd={() => { setTouching(false); setPos({ x: 0, y: 0 }); onMove(new THREE.Vector3()); }}
    >
      <div ref={baseRef} className="w-full h-full rounded-full bg-amber-900/20 border-2 border-amber-500/20 flex items-center justify-center">
        <div 
          className="w-12 h-12 rounded-full bg-amber-500/60 shadow-[0_0_15px_rgba(216,161,91,0.4)]"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        />
      </div>
    </div>
  );
}

export function Player() {
  const { camera, scene, gl } = useThree();
  const phase = useGameStore(s => s.phase);
  const flashlightOn = useGameStore(s => s.flashlightOn);
  const toggleFlashlight = useGameStore(s => s.toggleFlashlight);
  const setHoveredObject = useGameStore(s => s.setHoveredObject);
  const setInteractionPrompt = useGameStore(s => s.setInteractionPrompt);
  const [isLocked, setIsLocked] = useState(false);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const touchMoveDir = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef<THREE.Vector3 | null>(null);

  const keys = useRef<Record<string, boolean>>({});
  const isCrouching = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());

  // Handle tap-to-move for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if not touching buttons or joystick
      if ((e.target as HTMLElement).closest('button')) return;
      
      const touch = e.touches[0];
      const mouse = new THREE.Vector2(
        (touch.clientX / window.innerWidth) * 2 - 1,
        -(touch.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      for (const hit of intersects) {
        // If we hit the floor (or something low), set it as target
        if (hit.point.y < 0.5) {
          targetPos.current = hit.point.clone();
          targetPos.current.y = camera.position.y; // Keep eye level
          break;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, [isMobile, camera, scene]);

  // ✅ Set initial camera position once
  useEffect(() => {
    camera.position.set(0, 1.6, 1.5);
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ✅ Prevent page scrolling with WASD/arrow keys
      if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      keys.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'f') toggleFlashlight();
      // Stop auto-walking if key pressed
      targetPos.current = null;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleFlashlight]);

  useFrame((state, delta) => {
    if (phase !== 'playing' || (!isLocked && !isMobile)) return;

    // ✅ Cap delta to prevent huge jumps on tab refocus
    const safeDelta = Math.min(delta, 0.05);

    // Crouching
    isCrouching.current = !!keys.current['c'];
    const targetHeight = isCrouching.current ? 0.9 : 1.6;

    // ✅ Smooth camera height transition
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetHeight,
      0.15
    );

    // ✅ Simple direct speed - no velocity system needed for FPS walking
    const moveSpeed = keys.current['shift'] ? 4.0 : 2.0;

    // ✅ Get camera forward/right on the XZ plane only
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // ✅ Build movement vector directly
    const move = new THREE.Vector3();

    if (targetPos.current) {
      // Auto-walk to target
      const dir = targetPos.current.clone().sub(camera.position);
      if (dir.length() > 0.3) {
        dir.y = 0;
        move.copy(dir.normalize());
      } else {
        targetPos.current = null;
      }
    } else if (isMobile && touchMoveDir.current.length() > 0) {
      // Touch joystick movement
      move.addScaledVector(forward, -touchMoveDir.current.z);
      move.addScaledVector(right, touchMoveDir.current.x);
    } else {
      // Keyboard movement
      if (keys.current['w'] || keys.current['arrowup']) move.add(forward);
      if (keys.current['s'] || keys.current['arrowdown']) move.sub(forward);
      if (keys.current['d'] || keys.current['arrowright']) move.add(right);
      if (keys.current['a'] || keys.current['arrowleft']) move.sub(right);
    }

    // ✅ Normalize diagonal movement so it's not faster
    if (move.length() > 0) {
      move.normalize();
      move.multiplyScalar(moveSpeed * safeDelta);
    }

    // ✅ Apply X and Z movement separately for wall sliding
    const margin = 0.2;
    const bounds = COLLISION_WALLS[0];

    // --- Try X movement ---
    const nextX = camera.position.x + move.x;
    let canMoveX = true;

    // Wall bounds X
    if (nextX < bounds.minX + margin || nextX > bounds.maxX - margin) {
      canMoveX = false;
    }

    // Obstacle check X
    if (canMoveX) {
      for (const obs of COLLISION_OBSTACLES) {
        const hw = obs.w / 2 + margin;
        const hd = obs.d / 2 + margin;
        const checkZ = camera.position.z; // Use current Z for X check

        if (
          nextX > obs.x - hw &&
          nextX < obs.x + hw &&
          checkZ > obs.z - hd &&
          checkZ < obs.z + hd
        ) {
          canMoveX = false;
          break;
        }
      }
    }

    // --- Try Z movement ---
    const nextZ = camera.position.z + move.z;
    let canMoveZ = true;

    // Wall bounds Z
    if (nextZ < bounds.minZ + margin || nextZ > bounds.maxZ - margin) {
      canMoveZ = false;
    }

    // Obstacle check Z
    if (canMoveZ) {
      for (const obs of COLLISION_OBSTACLES) {
        const hw = obs.w / 2 + margin;
        const hd = obs.d / 2 + margin;
        const checkX = camera.position.x; // Use current X for Z check

        if (
          checkX > obs.x - hw &&
          checkX < obs.x + hw &&
          nextZ > obs.z - hd &&
          nextZ < obs.z + hd
        ) {
          canMoveZ = false;
          break;
        }
      }
    }

    // ✅ Apply movement
    if (canMoveX) camera.position.x = nextX;
    if (canMoveZ) camera.position.z = nextZ;

    // --- Interaction Raycasting ---
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let foundInteractable = false;

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;

      // Walk up parent chain to find interactable
      while (obj && !obj.userData?.interactable && obj.parent) {
        obj = obj.parent;
      }

      if (obj?.userData?.interactable) {
        const data = obj.userData;
        setHoveredObject(data.name);
        setInteractionPrompt(`${isMobile ? '[TAP PROMPT]' : '[E]'} ${data.prompt}`);

        if (keys.current['e']) {
          if (data.onInteract) data.onInteract();
          keys.current['e'] = false;
        }

        foundInteractable = true;
        break;
      }
    }

    if (!foundInteractable) {
      setHoveredObject(null);
      setInteractionPrompt(null);
    }
  });

  const handleMobileInteract = useCallback(() => {
    // Manually trigger 'E' for mobile when prompt is tapped
    keys.current['e'] = true;
  }, []);

  return (
    <>
      {!isMobile && (
        <PointerLockControls
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
        />
      )}
      {!isLocked && phase === 'playing' && (
        <Html center>
          <div
            onClick={() => !isMobile && gl.domElement.requestPointerLock()}
            className="bg-black/80 border border-amber-600/40 p-8 rounded-sm cursor-pointer hover:bg-black transition-all whitespace-nowrap"
          >
            <div className="text-amber-500 text-sm uppercase tracking-[0.4em] font-mono text-center mb-2">
              Investigation Ready
            </div>
            <div className="text-amber-200/40 text-[10px] font-mono text-center">
              {isMobile ? 'DRAG LEFT TO MOVE • DRAG RIGHT TO LOOK' : 'CLICK TO ENTER ROOM'}
            </div>
          </div>
        </Html>
      )}
      {isMobile && phase === 'playing' && (
        <Joystick onMove={(dir) => { touchMoveDir.current = dir; }} />
      )}
      {isMobile && phase === 'playing' && (
        <div className="fixed bottom-12 right-12 flex flex-col gap-4 z-50 pointer-events-auto">
          <button 
            onClick={toggleFlashlight}
            className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-2xl"
          >
            🔦
          </button>
          <button 
            onClick={handleMobileInteract}
            className="w-16 h-16 rounded-full bg-amber-500/40 border-2 border-amber-500 flex items-center justify-center text-xl font-bold font-mono text-white"
          >
            E
          </button>
        </div>
      )}
      <FlashlightSystem />
    </>
  );
}

function FlashlightSystem() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const flashlightOn = useGameStore(s => s.flashlightOn);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);

      const targetPos = new THREE.Vector3(0, 0, -1);
      targetPos.applyQuaternion(camera.quaternion);
      targetPos.add(camera.position);
      lightRef.current.target.position.copy(targetPos);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <spotLight
      ref={lightRef}
      intensity={flashlightOn ? 12 : 0}
      distance={15}
      angle={0.35}
      penumbra={0.7}
      decay={2}
      color="#fffaf0"
      castShadow
      shadow-bias={-0.0001}
    />
  );
}