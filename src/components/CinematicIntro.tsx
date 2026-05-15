import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
// Adjust the relative path below to match your project's actual gameStore location
import { useGameStore } from '../state/gameStore';
import * as THREE from 'three';
import gsap from 'gsap';

export function CinematicIntro() {
  const { camera } = useThree();
  // Extract phase directly from the Zustand store to fix "Cannot find name 'useGameStore'" usage
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore(s => s.setPhase);
  const setIntroComplete = useGameStore(s => s.setIntroComplete);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (phase !== 'intro' || hasPlayed.current) return;
    hasPlayed.current = true;

    // 1. Initial Position: Outside the room, looking toward the window
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 1.6, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        setIntroComplete(true);
        setPhase('playing');
        // Final position for Player to take over
        camera.position.set(0, 1.6, 2);
        camera.lookAt(0, 1.6, 0);
      }
    });

    // 2. Slow flight toward the room
    tl.to(camera.position, {
      x: 0,
      y: 1.8,
      z: 5,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(0, 1.6, 0)
    });

    // 3. Enter through the window/wall into the center
    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: 2,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: () => camera.lookAt(0, 1.6, 0)
    });

    // 4. Settle at player position
    tl.to({}, { duration: 1 }); // Brief pause

    // 5. Show titles
    const showTitle = (text: string, duration: number) => {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.top = '10%';
      el.style.left = '50%';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.color = '#F5D1A0';
      el.style.fontFamily = 'Courier Prime, monospace';
      el.style.fontSize = '3.5rem';
      el.style.fontWeight = 'bold';
      el.style.letterSpacing = '0.6em';
      el.style.textAlign = 'center';
      el.style.width = '100%';
      el.style.opacity = '0';
      el.style.zIndex = '1000';
      el.style.textShadow = '0 0 25px rgba(216, 161, 91, 0.6)';
      el.innerText = text;
      document.body.appendChild(el);
      
      gsap.to(el, { opacity: 1, duration: 1.5 });
      gsap.to(el, { opacity: 0, duration: 1.5, delay: duration - 1.5, onComplete: () => el.remove() });
    };

    setTimeout(() => showTitle("Case File #003", 3), 1000);
    setTimeout(() => showTitle("The Missing Developer", 3), 4000);

    return () => {
      tl.kill();
    };
  }, [phase, setPhase, setIntroComplete, camera]);

  return null;
}
