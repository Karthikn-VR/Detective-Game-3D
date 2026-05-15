import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
      onClick={onComplete}
    >
      <div className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(216, 161, 91, 0.2) 0%, transparent 60%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />
      
      <div className="text-center relative">
        <div className="text-amber-600/30 text-[15px] uppercase tracking-[0.5em] font-mono mb-3">
          VR Case Management System
        </div>
        <div className="text-amber-800/20 text-[8px] uppercase tracking-[0.3em] font-mono mb-8">
          Loading Case Files — CONFIDENTIAL
        </div>
        <div className="w-48 h-[2px] bg-amber-900/20 mx-auto">
          <motion.div
            className="h-full bg-amber-600/60"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-amber-800/30 text-[10px] font-mono mt-3">
          {progress < 30 ? 'Initializing...' : progress < 60 ? 'Loading evidence...' : progress < 90 ? 'Decrypting files...' : 'Ready.'}
        </div>
        <div className="mt-8 text-amber-900/20 text-[8px] uppercase tracking-widest animate-pulse">
          Click to skip
        </div>
      </div>
    </motion.div>
  );
}

function IntroCinematic() {
  const setPhase = useGameStore(s => s.setPhase);
  const setIntroComplete = useGameStore(s => s.setIntroComplete);
  const loadGame = useGameStore(s => s.loadGame);
  const addJournalEntry = useGameStore(s => s.addJournalEntry);
  const [textIndex, setTextIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const introTexts = [
    "The world is full of creators.",
    "But some build in the shadows.",
    "Karthikeyan VR. Developer. Architect.",
    "A trail of code left across the digital void.",
    "Tonight, we uncover his Case Files.",
  ];

  useEffect(() => {
    if (textIndex < introTexts.length) {
      const timer = setTimeout(() => setTextIndex(i => i + 1), 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowMenu(true), 500);
      return () => clearTimeout(timer);
    }
  }, [textIndex, introTexts.length]);

  const startGame = useCallback((isNewGame: boolean) => {
    console.log('Starting game...', isNewGame ? 'New' : 'Continue');
    if (!isNewGame) {
      loadGame();
    }
    addJournalEntry({
      id: 'case_start',
      timestamp: new Date().toLocaleTimeString(),
      text: 'Subject: Karthikeyan VR. Objective: Trace his development history. Starting with the office workspace.',
      category: 'observation'
    });
    setIntroComplete(true);
    setPhase('playing');
  }, [loadGame, addJournalEntry, setIntroComplete, setPhase]);

  const skipIntro = () => {
    setShowMenu(true);
    setTextIndex(introTexts.length + 1);
  };

  const hasSave = !!localStorage.getItem('midnight_case_save');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[90] bg-black flex items-center justify-center pointer-events-auto"
      style={{ cursor: 'default' }}
      onClick={() => {
        if (!showMenu) skipIntro();
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(216, 161, 91, 0.1) 0%, transparent 50%)',
        }}
      />
      
      <div className="text-center max-w-2xl px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
        >
          <h1 className="text-amber-400 text-5xl md:text-6xl uppercase tracking-[0.4em] font-mono mb-2 drop-shadow-[0_0_15px_rgba(216,161,91,0.4)]">
            MIDNIGHT
          </h1>
          <h2 className="text-amber-500 text-xl md:text-2xl uppercase tracking-[0.6em] font-mono mb-2 opacity-80">
            CASE
          </h2>
          <div className="w-32 h-[1px] bg-amber-500/50 mx-auto mb-10" />
        </motion.div>

        <div className="mt-12 min-h-[100px]">
          <AnimatePresence mode="wait">
            {textIndex <= introTexts.length && textIndex > 0 && (
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="text-amber-100 text-lg md:text-xl italic font-serif leading-relaxed drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              >
                {introTexts[textIndex - 1]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mt-12 space-y-3 relative z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame(true);
                }}
                className="block w-full sm:w-64 mx-auto py-5 sm:py-4 text-amber-200/60 hover:text-amber-100 text-sm sm:text-xs uppercase tracking-[0.3em] font-mono border border-amber-900/30 hover:border-amber-500/50 transition-all bg-black/50 hover:bg-amber-900/10 cursor-pointer pointer-events-auto active:scale-95"
              >
                New Investigation
              </button>
              {hasSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame(false);
                  }}
                  className="block w-full sm:w-64 mx-auto py-5 sm:py-4 text-amber-200/40 hover:text-amber-100 text-sm sm:text-xs uppercase tracking-[0.3em] font-mono border border-amber-900/20 hover:border-amber-500/50 transition-all bg-black/50 hover:bg-amber-900/10 cursor-pointer pointer-events-auto active:scale-95"
                >
                  Continue Case
                </button>
              )}
              
              <div className="mt-8 text-amber-800/20 text-[10px] font-mono pointer-events-none">
                <p>W/A/S/D to walk • Mouse to look</p>
                <p>ESC to pause • I for inventory • J for journal</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function IntroScreen() {
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setPhase);

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && (
        <LoadingScreen key="loading" onComplete={() => setPhase('intro')} />
      )}
      {phase === 'intro' && (
        <IntroCinematic key="intro" />
      )}
    </AnimatePresence>
  );
}
