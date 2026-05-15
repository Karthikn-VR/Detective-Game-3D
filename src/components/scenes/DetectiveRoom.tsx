import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

// Flashlight (Torch) that follows the camera
function Flashlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);
  const flashlightOn = useGameStore(s => s.flashlightOn);

  useFrame(() => {
    if (lightRef.current) {
      // Position the light slightly in front of the camera
      lightRef.current.position.copy(camera.position);
      
      // Point the light in the direction the camera is looking
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
      intensity={flashlightOn ? 2.5 : 0}
      distance={10}
      angle={0.4}
      penumbra={0.5}
      decay={2}
      color="#fffaf0"
      castShadow
    />
  );
}

// Dust Particles
function DustParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(Date.now() * 0.0003 + i) * 0.0005);
      pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.0002 + i * 0.5) * 0.0003);
      if (pos.getY(i) > 3) pos.setY(i, 0);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#D8A15B"
        size={0.012}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Smoke effect near the ashtray
function SmokeParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 50;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0.3 + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 1] = 0.85 + Math.random() * 0.5;
      pos[i * 3 + 2] = -0.85 + (Math.random() - 0.5) * 0.1;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      y += 0.001;
      const x = pos.getX(i) + Math.sin(Date.now() * 0.001 + i) * 0.0005;
      if (y > 1.8) {
        y = 0.85;
      }
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#888888"
        size={0.025}
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Volumetric fog planes
function VolumetricFog() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      (child as THREE.Mesh).position.x = Math.sin(Date.now() * 0.00015 + i * 2) * 0.3;
    });
  });

  return (
    <group ref={ref}>
      {[0.5, 1.0, 1.5, 2.0].map((y, i) => (
        <mesh key={i} position={[0, y, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 6]} />
          <meshBasicMaterial
            color="#1a1510"
            transparent
            opacity={0.03}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Rain outside window
function RainEffect() {
  const ref = useRef<THREE.Points>(null);
  const count = 500;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -0.842 - 0.5 + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = -2.5 - Math.random() * 2;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      y -= 0.05;
      if (y < 0) {
        y = 4;
        pos.setX(i, -0.842 - 0.5 + (Math.random() - 0.5) * 2);
      }
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6699cc"
        size={0.008}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Lighting setup
function SceneLighting() {
  const bulbRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (bulbRef.current) {
      bulbRef.current.intensity = 2.0 + Math.sin(Date.now() * 0.01) * 0.1 + Math.random() * 0.05;
    }
  });

  return (
    <>
      {/* Main hanging bulb - warm tungsten */}
      <pointLight
        ref={bulbRef}
        position={[0, 2.0, -0.5]}
        color="#D8A15B"
        intensity={2.0}
        distance={10}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* CRT monitor glow */}
      <pointLight
        position={[0.95, 1.0, -0.6]}
        color="#008CCE"
        intensity={0.6}
        distance={3}
        decay={2}
      />
      
      {/* Desk lamp */}
      <spotLight
        position={[-0.58, 1.2, -0.7]}
        color="#D8A15B"
        intensity={1.5}
        angle={0.6}
        penumbra={0.8}
        distance={4}
        decay={2}
      />
      
      {/* Window moonlight */}
      <directionalLight
        position={[-0.842, 2.5, -4]}
        color="#4466aa"
        intensity={0.4}
      />
      
      {/* Floor lamp */}
      <pointLight
        position={[2.5, 1.79, 1.8]}
        color="#D8A15B"
        intensity={0.8}
        distance={6}
        decay={2}
      />
      
      {/* Ambient */}
      <ambientLight color="#1a1520" intensity={0.4} />
      
      {/* Door light leak */}
      <spotLight
        position={[1.5, 0.54, -2.43]}
        color="#aa8855"
        intensity={0.5}
        angle={0.3}
        penumbra={1}
        distance={5}
      />

      {/* Hemisphere for fill */}
      <hemisphereLight
        color="#2a2040"
        groundColor="#1a0f0a"
        intensity={0.3}
      />
    </>
  );
}

export function DetectiveRoomEnvironment() {
  return (
    <group>
      <SceneLighting />
      <Flashlight />
      <DustParticles />
      <SmokeParticles />
      <VolumetricFog />
      <RainEffect />
      <fog attach="fog" args={['#0a0a0f', 1, 15]} />
    </group>
  );
}
