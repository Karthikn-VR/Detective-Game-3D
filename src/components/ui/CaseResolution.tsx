import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';

export function CaseResolution() {
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setPhase);
  const objectives = useGameStore(s => s.objectives);
  const inventory = useGameStore(s => s.inventory);
  const journal = useGameStore(s => s.journal);
  // Removed unused evidenceCount variable to resolve TypeScript warning
  const completeObjective = useGameStore(s => s.completeObjective);
  const addJournalEntry = useGameStore(s => s.addJournalEntry);
  const [showResolution, setShowResolution] = useState(false);
  const [resolutionStep, setResolutionStep] = useState(0);

  // Key evidence IDs for solving
  const hasEnvelope = inventory.some(i => i.id === 'safe_envelope');
  const hasTape = inventory.some(i => i.id === 'audio_tape');
  const hasGithub = inventory.some(i => i.id === 'github_data');
  const hasVoicemail = inventory.some(i => i.id === 'voicemail');
  const hasCaseFile = inventory.some(i => i.id === 'case_file');
  const hasNotebook = inventory.some(i => i.id === 'secret_notebook');
  const hasArchitecture = inventory.some(i => i.id === 'board_photo');
  const hasCert = inventory.some(i => i.id === 'evidence_bag');

  const canSolve = hasEnvelope && hasTape && hasGithub && hasVoicemail && hasCaseFile && hasNotebook && hasArchitecture && hasCert;
  const solvedCount = objectives.filter(o => o.completed).length;

  const resolutionTexts = [
    "The search was thorough. Every project examined. Every code snippet analyzed.",
    "But the realization hits like a sudden compile error.",
    "The subject was never missing.",
    "He was here all along. Building. Learning. Updating. .",
    "\"The missing person was never lost. He was still building himself.\"",
    "Karthikeyan VR (Mochaa)",
    "Software Engineer | AI | Full Stack | Builder",
    "karthikeyan33607@gmail.com",
    "linkedin.com/in/karthikeyan-v-r-434268274"
  ];

  const categoryColors: Record<string, string> = {
    clue: 'text-red-400/70',
    observation: 'text-blue-400/70',
    deduction: 'text-amber-400/70',
    dialogue: 'text-green-400/70',
  };

  useEffect(() => {
    if (showResolution && resolutionStep < resolutionTexts.length) {
      const timer = setTimeout(() => {
        setResolutionStep(s => s + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showResolution, resolutionStep, resolutionTexts.length]);

  const handleSolveCase = () => {
    completeObjective('solve_case');
    addJournalEntry({
      id: 'case_solved',
      timestamp: new Date().toLocaleTimeString(),
      text: 'Case SOLVED. Karthikeyan VR is not a missing person, but a tireless creator. The evidence points to a career built on innovation and continuous learning.',
      category: 'deduction'
    });
    setShowResolution(true);
  };

  // Show the "solve case" button when enough evidence
  return (
    <>
      {/* Solve case button */}
      {canSolve && !showResolution && !objectives.find(o => o.id === 'solve_case')?.completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleSolveCase}
            className="px-12 py-4 bg-amber-600/20 border-2 border-amber-500/60 text-amber-200 text-lg uppercase tracking-[0.4em] font-mono hover:bg-amber-600/40 hover:border-amber-400 transition-all shadow-[0_0_30px_rgba(216,161,91,0.3)] animate-pulse"
            style={{ cursor: 'pointer' }}
          >
            ⚖ Finalize Profile
          </button>
        </motion.div>
      )}

      {/* Resolution sequence */}
      <AnimatePresence>
        {showResolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-12 text-center"
          >
            <div className="max-w-4xl w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={resolutionStep}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.5 }}
                  className="space-y-6"
                >
                  {resolutionStep < resolutionTexts.length ? (
                    <>
                      <p className="text-amber-200 text-3xl md:text-4xl font-serif italic leading-relaxed drop-shadow-[0_0_20px_rgba(216,161,91,0.5)]">
                        {resolutionTexts[resolutionStep]}
                      </p>
                      
                      {resolutionStep >= resolutionTexts.length - 4 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="w-48 h-[1px] bg-amber-500/40 mx-auto"
                        />
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                      <div className="space-y-2">
                        <div className="text-amber-500/40 text-xs uppercase tracking-[0.5em] font-mono mb-4">Investigation Complete</div>
                        <h2 className="text-amber-200 text-5xl font-mono tracking-tighter">KARTHIKEYAN VR</h2>
                        <div className="text-amber-400/60 text-sm font-mono tracking-[0.3em] uppercase">Software Engineer | AI | Full Stack</div>
                      </div>
                      
                      <div className="flex justify-center gap-12 text-amber-100/40 font-mono text-[10px] uppercase tracking-widest">
                        <a href="mailto:karthikeyan33607@gmail.com" className="hover:text-amber-200 transition-colors">Email</a>
                        <a href="https://linkedin.com/in/karthikeyan-v-r-434268274" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors">LinkedIn</a>
                        <a href="https://github.com/Karthikn-VR" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors">GitHub</a>
                      </div>

                      <button
                        onClick={() => {
                          setShowResolution(false);
                          setResolutionStep(0);
                        }}
                        className="mt-12 px-8 py-2 text-amber-500/40 hover:text-amber-500/80 text-[10px] uppercase tracking-[0.2em] font-mono border border-amber-900/30 hover:border-amber-500/50 transition-all"
                      >
                        Return to Office
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
