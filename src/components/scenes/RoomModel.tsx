import { useRef, useCallback, Suspense, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../state/gameStore';

// Preload the model
useGLTF.preload('/room.glb');

// Invisible Interaction Volume component
function Interactable({
  position,
  name,
  prompt,
  onInteract,
  size = [0.5, 0.5, 0.5],
}: {
  position: [number, number, number];
  name: string;
  prompt: string;
  onInteract: () => void;
  size?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      position={position}
      userData={{ 
        interactable: true, 
        name, 
        prompt, 
        onInteract 
      }}
      visible={false} // Hidden, but used for raycasting
    >
      <boxGeometry args={size} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  );
}

// GLB Room loader
function GLBRoom() {
  const { scene } = useGLTF('/room.glb');
  
  // Disable all cinematic cameras in the GLTF
  useEffect(() => {
    scene.traverse((child) => {
      if (child.type === 'PerspectiveCamera' || child.type === 'OrthographicCamera') {
        child.visible = false;
        // @ts-ignore
        child.isActive = false;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

export function RoomModel() {
  const addItem = useGameStore(s => s.addItem);
  const addJournalEntry = useGameStore(s => s.addJournalEntry);
  const setMonologue = useGameStore(s => s.setMonologue);
  const completeObjective = useGameStore(s => s.completeObjective);
  const solvePuzzle = useGameStore(s => s.solvePuzzle);
  const puzzlesSolved = useGameStore(s => s.puzzlesSolved);
  const setRugMoved = useGameStore(s => s.setRugMoved);
  const rugMoved = useGameStore(s => s.rugMoved);
  const setPhase = useGameStore(s => s.setPhase);

  const showMonologue = useCallback((text: string) => {
    setMonologue(text);
    setTimeout(() => setMonologue(null), 4000);
  }, [setMonologue]);

  // INTERACTIONS - No longer teleport camera
  const handleInvestigationBoard = useCallback(() => {
    completeObjective('investigate_board');
    addJournalEntry({ id: 'board_examined', timestamp: new Date().toLocaleTimeString(), text: 'The board contains ideas, project notes, and connections between different experiments.', category: 'clue' });
    showMonologue('"Different attempts... looks like someone learning by building."');
    addItem({ id: 'board_photo', name: 'System Architecture', description: 'A detailed diagram of a multi-agent AI system architecture.', icon: '🏗️', type: 'photo', found: true });
  }, [completeObjective, addJournalEntry, showMonologue, addItem]);

  const handleComputer = useCallback(() => {
    setPhase('computer');
    completeObjective('check_computer');
    addJournalEntry({ id: 'computer_checked', timestamp: new Date().toLocaleTimeString(), text: 'Accessed the main terminal. Fetching repository data from GitHub...', category: 'clue' });
    showMonologue('"The terminal is active. Let\'s see what he\'s been building."');
  }, [setPhase, completeObjective, addJournalEntry, showMonologue]);

  const handleDesk = useCallback(() => {
    completeObjective('find_evidence');
    addItem({ id: 'magnifying_glass', name: 'Logic Debugger', description: 'Used for finding the bugs.', icon: '🔍', type: 'evidence', found: true });
    addItem({ id: 'evidence_bag', name: 'AWS Certification', description: 'Certification notes collected during learning.', icon: '☁️', type: 'evidence', found: true });
    showMonologue('"Looks like structured learning alongside projects."');
  }, [completeObjective, addItem, showMonologue]);

  const handleCabinets = useCallback(() => {
    completeObjective('search_cabinets');
    addItem({ id: 'case_file', name: 'Profile: Karthikeyan VR', description: 'A software developer.', icon: '👤', type: 'evidence', found: true });
    addItem({ id: 'hidden_key', name: 'SSH Key', description: 'A private key found in the cabinet. Grants access to the core repositories.', icon: '🔑', type: 'key', found: true });
    showMonologue('"No clear pattern. Mostly curiosity and persistence."');
  }, [completeObjective, addItem, showMonologue]);

  const handleBookshelf = useCallback(() => {
    completeObjective('check_bookshelf');
    addItem({ id: 'secret_notebook', name: 'Algorithm Sketches', description: 'Hand-drawn architectures.', icon: '📓', type: 'note', found: true });
    showMonologue('"Learning notes. Some complete, some abandoned.."');
    if (!puzzlesSolved.includes('bookshelf')) {
      solvePuzzle('bookshelf');
    }
  }, [completeObjective, puzzlesSolved, solvePuzzle, addItem, showMonologue]);

  const handleRug = useCallback(() => {
    if (!rugMoved) {
      setRugMoved(true);
      completeObjective('find_hidden_safe');
      showMonologue('"Hidden notes. Older work, maybe. Different "Time"."');
    }
    // Always allow opening the puzzle UI even if moved
    setPhase('puzzle');
  }, [rugMoved, setRugMoved, completeObjective, showMonologue, setPhase]);

  const handleClock = useCallback(() => {
    showMonologue('"The commit history shows a burst of activity at 07:47."');
    if (!puzzlesSolved.includes('clock')) {
      solvePuzzle('clock');
    }
  }, [puzzlesSolved, solvePuzzle, showMonologue]);

  const handlePhone = useCallback(() => {
    addItem({ id: 'voicemail', name: 'Client Feedback', description: '"Old feedback mentioning useful work and collaboration."', icon: '📞', type: 'audio', found: true });
    showMonologue('"Looks like some projects ended well."');
    if (!puzzlesSolved.includes('phone')) {
      solvePuzzle('phone');
    }
  }, [puzzlesSolved, solvePuzzle, addItem, showMonologue]);

  const handleGramophone = useCallback(() => {
    showMonologue('"Wait... there are numbers written under the vinyl label: 7-4-...Hmmmm..Not Clear"');
    addItem({ id: 'safe_clue', name: 'Safe Combination', description: 'Numbers found on a vinyl record: 7-4-.', icon: '🎵', type: 'note', found: true });
  }, [addItem, showMonologue]);

  const handleCoatRack = useCallback(() => {
    addItem({ id: 'train_ticket', name: 'Conference Ticket', description: 'A ticket to a SpiderMan Film.', icon: '🎫', type: 'note', found: true });
    showMonologue('"He was planning to go a Movie"');
  }, [addItem, showMonologue]);

  const handlePosters = useCallback(() => {
    addItem({ id: 'fixer_poster', name: 'The "Fixer" Poster', description: 'Marvel Poster', icon: '🖼️', type: 'photo', found: true });
    showMonologue('"The Avengers..."');
  }, [addItem, showMonologue]);

  return (
    <group>
      <Suspense fallback={null}>
        <GLBRoom />
      </Suspense>
      
      {/* Invisible raycast targets at interaction positions */}
      <Interactable position={[-2.83, 1.9, -2.1]} name="Investigation Board" prompt="Inspect Board" onInteract={handleInvestigationBoard} size={[1.5, 1.2, 0.1]} />
      <Interactable position={[0.95, 1.0, -0.6]} name="Computer Terminal" prompt="Use Terminal" onInteract={handleComputer} size={[0.5, 0.4, 0.4]} />
      <Interactable position={[-0.3, 0.85, -0.35]} name="Desk" prompt="Search Desk" onInteract={handleDesk} size={[1, 0.2, 0.6]} />
      <Interactable position={[2.45, 0.7, -1.8]} name="Filing Cabinets" prompt="Search Cabinets" onInteract={handleCabinets} size={[0.8, 1, 0.5]} />
      <Interactable position={[-2.1, 1.1, 0.5]} name="Bookshelf" prompt="Search Bookshelf" onInteract={handleBookshelf} size={[0.6, 1.5, 0.4]} />
      <Interactable position={[-0.068, 0.05, -0.375]} name="Rug" prompt="Examine Rug" onInteract={handleRug} size={[1.5, 0.1, 1.5]} />
      <Interactable position={[-0.5, 2.8, -2.4]} name="Clock" prompt="Inspect Clock" onInteract={handleClock} size={[0.4, 0.4, 0.1]} />
      <Interactable position={[-0.95, 0.9, -0.2]} name="Phone" prompt="Listen to Phone" onInteract={handlePhone} size={[0.3, 0.3, 0.3]} />
      
      <Interactable position={[2, 0.5, -0.5]} name="Gramophone" prompt="Inspect Record" onInteract={handleGramophone} size={[0.5, 0.5, 0.5]} />
      <Interactable position={[0.52, 1, -2.055]} name="Coat Rack" prompt="Search Coat" onInteract={handleCoatRack} size={[0.4, 1.5, 0.4]} />
      <Interactable position={[0.4, 2, -2.41]} name="Wanted Posters" prompt="Examine Posters" onInteract={handlePosters} size={[1, 1, 0.1]} />
    </group>
  );
}
