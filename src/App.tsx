import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './state/gameStore';
import { DetectiveRoomEnvironment } from './components/scenes/DetectiveRoom';
import { RoomModel } from './components/scenes/RoomModel';
import { Player } from './components/Player';
import { CinematicIntro } from './components/CinematicIntro';
import { InputHandler } from './components/systems/InputHandler';
import { GameHUD } from './components/ui/GameHUD';
import { IntroScreen } from './components/ui/IntroScreen';
import { CaseResolution } from './components/ui/CaseResolution';

export default function App() {
  const phase = useGameStore(s => s.phase);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative touch-none select-none" style={{ cursor: 'crosshair' }}>
      <Canvas
        shadows
        camera={{ position: [5, 5, 8], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 2]} // Performance optimization for mobile retina displays
        gl={{ 
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 0.8,
        }}
        style={{ background: '#000000' }}
      >
        <color attach="background" args={['#020205']} />
        
        <DetectiveRoomEnvironment />
        
        <Suspense fallback={null}>
          <RoomModel />
        </Suspense>

        {phase === 'intro' && <CinematicIntro />}
        {phase === 'playing' && <Player />}
      </Canvas>

      <IntroScreen />
      <GameHUD />
      <CaseResolution />
      <InputHandler />
      
      <style>{`
        * {
          font-family: 'Courier Prime', 'Courier New', monospace;
          user-select: none;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #000;
        }

        .cursor-none {
          cursor: none;
        }
      `}</style>
    </div>
  );
}
