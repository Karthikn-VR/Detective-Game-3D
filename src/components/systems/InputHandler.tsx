import { useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';

export function InputHandler() {
  const setPhase = useGameStore(s => s.setPhase);
  const phase = useGameStore(s => s.phase);
  const toggleFlashlight = useGameStore(s => s.toggleFlashlight);
  const toggleInventory = useGameStore(s => s.toggleInventory);
  const toggleJournal = useGameStore(s => s.toggleJournal);
  const setCameraTarget = useGameStore(s => s.setCameraTarget);
  const saveGame = useGameStore(s => s.saveGame);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Escape
      if (key === 'escape') {
        if (phase === 'computer' || phase === 'puzzle') {
          setPhase('playing');
        } else if (phase === 'playing') {
          setPhase('paused');
        } else if (phase === 'paused') {
          setPhase('playing');
        }
      }

      if (phase !== 'playing') return;

      switch (key) {
        case 'i':
          toggleInventory();
          break;
        case 'j':
          toggleJournal();
          break;
        case 'f5':
          e.preventDefault();
          saveGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, setPhase, toggleFlashlight, toggleInventory, toggleJournal, setCameraTarget, saveGame]);

  return null;
}
