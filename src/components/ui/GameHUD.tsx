import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/gameStore';

// Crosshair
function Crosshair() {
  const hoveredObject = useGameStore(s => s.hoveredObject);
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className={`transition-all duration-300 ${hoveredObject ? 'scale-150' : 'scale-100'}`}>
        <div className="w-6 h-6 relative">
          <div className={`absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 ${hoveredObject ? 'bg-amber-400' : 'bg-white/40'}`} />
          <div className={`absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 ${hoveredObject ? 'bg-amber-400' : 'bg-white/40'}`} />
          {hoveredObject && (
            <div className="absolute inset-0 border border-amber-400/50 rounded-full animate-ping" />
          )}
        </div>
      </div>
    </div>
  );
}

// Interaction Prompt
function InteractionPrompt() {
  const prompt = useGameStore(s => s.interactionPrompt);
  
  return (
    <AnimatePresence>
      {prompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="bg-black/80 border-2 border-amber-500/60 px-10 py-4 rounded-sm backdrop-blur-md shadow-[0_0_30px_rgba(216,161,91,0.2)]">
            <span className="text-amber-400 font-mono text-lg tracking-[0.2em] font-bold">{prompt}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Detective Monologue
function Monologue() {
  const monologue = useGameStore(s => s.monologue);
  
  return (
    <AnimatePresence>
      {monologue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none max-w-2xl w-full"
        >
          <div className="text-center px-8">
            <p className="text-white text-2xl italic font-serif leading-relaxed tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {monologue}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Objective Display
function ObjectiveDisplay() {
  const currentObjective = useGameStore(s => s.currentObjective);
  const evidenceCount = useGameStore(s => s.evidenceCount);
  const totalEvidence = useGameStore(s => s.totalEvidence);
  
  return (
    <div className="fixed top-6 left-6 z-30 pointer-events-none">
      <div className="bg-black/50 border-l-2 border-amber-600/60 px-4 py-2 backdrop-blur-sm">
        <div className="text-amber-600/60 text-[10px] uppercase tracking-[0.3em] font-mono mb-1">Current Objective</div>
        <div className="text-amber-100/70 text-xs font-mono">{currentObjective}</div>
      </div>
      <div className="mt-3 bg-black/50 border-l-2 border-red-800/60 px-4 py-2 backdrop-blur-sm">
        <div className="text-red-600/60 text-[10px] uppercase tracking-[0.3em] font-mono mb-1">Evidence</div>
        <div className="text-red-100/70 text-xs font-mono">{evidenceCount} / {totalEvidence}</div>
        <div className="mt-1 w-24 h-[2px] bg-red-900/30">
          <div 
            className="h-full bg-red-600/60 transition-all duration-500" 
            style={{ width: `${(evidenceCount / totalEvidence) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

// Controls hint
function ControlsHint() {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-30 pointer-events-none"
        >
          <div className="bg-black/60 border border-amber-900/30 px-4 py-3 backdrop-blur-sm text-[10px] font-mono text-amber-200/40 space-y-1 hidden sm:block">
            <div>W/A/S/D — Move</div>
            <div>Mouse — Look Around</div>
            <div>SHIFT — Sprint</div>
            <div>C — Crouch</div>
            <div>F — Toggle Flashlight (Torch)</div>
            <div>E — Interact</div>
            <div>I — Inventory</div>
            <div>J — Journal</div>
            <div>ESC — Pause</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inventory Panel
function InventoryPanel() {
  const inventory = useGameStore(s => s.inventory);
  const showInventory = useGameStore(s => s.showInventory);
  const toggleInventory = useGameStore(s => s.toggleInventory);
  const selectedItem = useGameStore(s => s.selectedItem);
  const setSelectedItem = useGameStore(s => s.setSelectedItem);
  
  const selected = inventory.find(i => i.id === selectedItem);
  
  return (
    <AnimatePresence>
      {showInventory && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 bottom-0 w-80 z-50 bg-black/90 border-l border-amber-900/30 backdrop-blur-md"
          style={{ cursor: 'default' }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-amber-500/80 text-sm uppercase tracking-[0.3em] font-mono">Evidence Locker</h2>
              <button 
                onClick={toggleInventory} 
                className="text-amber-600/50 hover:text-amber-400 text-xs font-mono"
              >
                [CLOSE]
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {inventory.length === 0 ? (
                <p className="text-amber-100/30 text-xs italic">No items collected yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="border border-amber-500/30 p-4 bg-amber-950/10 hover:border-amber-400 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(216,161,91,0.5)]">{item.icon}</span>
                        <span className="text-amber-200 font-mono text-sm font-bold uppercase tracking-widest">{item.name}</span>
                      </div>
                      <p className="text-amber-100/60 text-[11px] leading-relaxed italic">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Journal Panel
function JournalPanel() {
  const journal = useGameStore(s => s.journal);
  const showJournal = useGameStore(s => s.showJournal);
  const toggleJournal = useGameStore(s => s.toggleJournal);
  
  const categoryColors: Record<string, string> = {
    clue: 'text-red-400/70',
    observation: 'text-blue-400/70',
    deduction: 'text-amber-400/70',
    dialogue: 'text-green-400/70',
  };

  const categoryLabels: Record<string, string> = {
    clue: '🔴 CLUE',
    observation: '🔵 OBSERVATION',
    deduction: '🟡 DEDUCTION',
    dialogue: '🟢 DIALOGUE',
  };
  
  return (
    <AnimatePresence>
      {showJournal && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed left-0 top-0 bottom-0 w-96 z-50 bg-black/90 border-r border-amber-900/30 backdrop-blur-md overflow-y-auto"
          style={{ cursor: 'default' }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-amber-500/80 text-sm uppercase tracking-[0.3em] font-mono">Detective&apos;s Journal</h2>
              <button 
                onClick={toggleJournal} 
                className="text-amber-600/50 hover:text-amber-400 text-xs font-mono"
              >
                [CLOSE]
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {journal.length === 0 ? (
                <p className="text-amber-100/30 text-xs italic">No entries yet.</p>
              ) : (
                journal.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-amber-600/50 pl-4 py-1">
                    <div className="text-amber-500/60 text-[10px] font-mono mb-1">{entry.timestamp} — {entry.category.toUpperCase()}</div>
                    <p className="text-amber-100 text-[13px] leading-relaxed drop-shadow-[0_0_5px_rgba(216,161,91,0.2)]">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pause Menu
function PauseMenu() {
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setPhase);
  const saveGame = useGameStore(s => s.saveGame);
  const objectives = useGameStore(s => s.objectives);
  
  if (phase !== 'paused') return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
      style={{ cursor: 'default' }}
    >
      <div className="text-center">
        <h1 className="text-amber-500/60 text-2xl uppercase tracking-[0.5em] font-mono mb-2">Paused</h1>
        <div className="w-32 h-[1px] bg-amber-600/30 mx-auto mb-8" />
        
        <div className="space-y-3">
          <button
            onClick={() => setPhase('playing')}
            className="block w-48 mx-auto py-2 text-amber-200/60 hover:text-amber-100 text-xs uppercase tracking-[0.2em] font-mono border border-amber-900/30 hover:border-amber-600/50 transition-all bg-black/30"
          >
            Resume
          </button>
          <button
            onClick={() => { saveGame(); }}
            className="block w-48 mx-auto py-2 text-amber-200/60 hover:text-amber-100 text-xs uppercase tracking-[0.2em] font-mono border border-amber-900/30 hover:border-amber-600/50 transition-all bg-black/30"
          >
            Save Game
          </button>
        </div>
        
        <div className="mt-8 text-left max-w-sm mx-auto">
          <div className="text-amber-600/40 text-[10px] uppercase tracking-[0.3em] font-mono mb-3">Objectives</div>
          {objectives.map(obj => (
            <div key={obj.id} className="flex items-center gap-2 mb-1">
              <span className={`text-xs ${obj.completed ? 'text-green-500/60' : 'text-amber-800/40'}`}>
                {obj.completed ? '✓' : '○'}
              </span>
              <span className={`text-xs font-mono ${obj.completed ? 'text-amber-200/30 line-through' : 'text-amber-200/50'}`}>
                {obj.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Computer Terminal UI
function ComputerTerminal() {
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setPhase);
  const setCameraTarget = useGameStore(s => s.setCameraTarget);
  const addJournalEntry = useGameStore(s => s.addJournalEntry);
  const setMonologue = useGameStore(s => s.setMonologue);
  const addItem = useGameStore(s => s.addItem);
  const [input, setInput] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([
    '> MOCHAA_OS v4.0.0',
    '> Logged in as: KARTHIKEYAN VR',
    '> Status: BUILDING THE FUTURE',
    '> ',
    '> Type HELP for available commands.',
    '> GitHub integration active.',
  ]);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.github.com/users/Karthikn-VR/repos?sort=updated&per_page=10');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRepos(data);
        return data;
      }
    } catch (e) {
      console.error('Failed to fetch repos', e);
    } finally {
      setLoading(false);
    }
    return [];
  };

  const handleCommand = useCallback(async (cmd: string) => {
    const c = cmd.toLowerCase().trim();
    const newOutput = [...output, `> ${cmd}`];
    
    if (c === 'help') {
      newOutput.push(
        '  Available commands:',
        '  REPOS    - Fetch GitHub repositories',
        '  PROFILE  - View developer profile',
        '  CONTACT  - View contact information',
        '  SKILLS   - List technical skills',
        '  EXIT     - Exit terminal',
      );
    } else if (c === 'repos') {
      newOutput.push('  Fetching latest from github.com/Karthikn-VR...');
      const latestRepos = await fetchRepos();
      if (latestRepos.length > 0) {
        newOutput.push('  --- LATEST REPOSITORIES ---');
        latestRepos.forEach((repo: any) => {
          newOutput.push(`  [★ ${repo.stargazers_count}] ${repo.name.padEnd(20)} - ${repo.language || 'Mixed'}`);
          if (repo.description) newOutput.push(`    "${repo.description}"`);
        });
        newOutput.push('  ', '  Type REPO [NAME] for more details.');
      } else {
        newOutput.push('  Error: Could not reach GitHub API.');
      }
      
      addItem({
        id: 'github_data',
        name: 'GitHub Repository List',
        description: 'A live-fetched list of Karthikeyan\'s latest work and open-source contributions.',
        icon: '🐙',
        type: 'note',
        found: true
      });
      addJournalEntry({
        id: 'repos_fetched',
        timestamp: new Date().toLocaleTimeString(),
        text: 'Connected to GitHub. The code quality is exceptional. He\'s building everything from AI agents to full-stack platforms.',
        category: 'observation'
      });
    } else if (c === 'profile') {
      newOutput.push(
        '  --- DEVELOPER PROFILE ---',
        '  Name: Karthikeyan VR (Mochaa)',
        '  Role: Software Engineer | AI | Full Stack',
        '  Focus: Building scalable AI-driven solutions',
        '  Status: Actively innovating',
      );
    } else if (c === 'contact') {
      newOutput.push(
        '  --- CONTACT INFO ---',
        '  Email: karthikeyan33607@gmail.com',
        '  LinkedIn: linkedin.com/in/karthikeyan-v-r-434268274',
        '  GitHub: github.com/Karthikn-VR',
      );
    } else if (c === 'skills') {
      newOutput.push(
        '  --- TECHNICAL STACK ---',
        '  Languages: TypeScript, Python, JavaScript',
        '  Frontend: React, Next.js, Three.js, Tailwind',
        '  Backend: Node.js, Express, FastAPI, PostgreSQL',
        '  AI/ML: OpenAI, LangChain, Transformers, PyTorch',
        '  DevOps: Docker, AWS, GitHub Actions, CI/CD',
      );
    } else if (c === 'exit') {
      setPhase('playing');
      setCameraTarget(null);
      return;
    } else {
      newOutput.push(`  Command not recognized: "${cmd}"`);
    }
    
    setOutput(newOutput);
    setInput('');
  }, [output, addItem, addJournalEntry, setPhase, setCameraTarget]);
  
  if (phase !== 'computer') return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ cursor: 'text' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => { setPhase('playing'); setCameraTarget(null); }} />
      <div className="bg-black/80 border-2 border-amber-900/40 p-1 sm:p-2 backdrop-blur-md flex flex-col h-[70vh] sm:h-[60vh] max-h-[500px] w-full max-w-[600px] relative">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-amber-900/30 bg-amber-950/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <div className="text-[10px] text-amber-500/40 font-mono tracking-widest uppercase">MOCHAA_TERMINAL_V4</div>
          <button onClick={() => { setPhase('playing'); setCameraTarget(null); }} className="text-amber-500/60 hover:text-amber-200">×</button>
        </div>

        <div className="p-4 sm:p-6 h-full flex flex-col font-mono text-[#00ff88] text-xs sm:text-sm shadow-[inset_0_0_20px_rgba(0,255,136,0.1)] overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-2 space-y-1 scrollbar-hide">
            {output.map((line, i) => (
              <div key={i} className="leading-relaxed whitespace-pre-wrap drop-shadow-[0_0_5px_rgba(0,255,136,0.3)]">{line}</div>
            ))}
            {loading && <div className="animate-pulse">Fetching data...</div>}
          </div>
          <div className="flex items-center border-t border-[#00ff88]/30 pt-3">
            <span className="mr-3 text-lg animate-pulse">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && input.trim()) {
                  handleCommand(input);
                }
              }}
              className="flex-1 bg-transparent text-[#00ff88] outline-none font-mono text-xs sm:text-sm caret-[#00ff88] placeholder-[#00ff88]/30"
              autoFocus
              placeholder="Enter command..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Safe Puzzle UI
function SafePuzzle() {
  const phase = useGameStore(s => s.phase);
  const setPhase = useGameStore(s => s.setPhase);
  const setSafeOpened = useGameStore(s => s.setSafeOpened);
  const completeObjective = useGameStore(s => s.completeObjective);
  const addItem = useGameStore(s => s.addItem);
  const addJournalEntry = useGameStore(s => s.addJournalEntry);
  const setMonologue = useGameStore(s => s.setMonologue);
  const [combo, setCombo] = useState([0, 0, 0]);
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);
  
  const adjustDigit = (index: number, delta: number) => {
    const newCombo = [...combo];
    newCombo[index] = (newCombo[index] + delta + 10) % 10;
    setCombo(newCombo);
    setError(false);
  };
  
  const tryOpen = () => {
    if (combo[0] === 7 && combo[1] === 4 && combo[2] === 7) {
      setSolved(true);
      setSafeOpened(true);
      completeObjective('crack_safe');
      addItem({
        id: 'safe_envelope',
        name: 'The Revelation',
        description: 'A message from the developer: "The missing person was never lost. He was still building himself."',
        icon: '✉️',
        type: 'evidence',
        found: true
      });
      addItem({
        id: 'audio_tape',
        name: 'Final Log',
        description: 'Karthikeyan VR (Mochaa) - Software Engineer | AI | Full Stack | Builder',
        icon: '📼',
        type: 'audio',
        found: true
      });
      addJournalEntry({
        id: 'safe_opened',
        timestamp: new Date().toLocaleTimeString(),
        text: 'Cracked the vault! The mystery of Karthikeyan VR is solved. He wasn\'t missing—he was evolving.',
        category: 'deduction'
      });
      setMonologue('"The missing person was never lost. He was still building himself."');
      setTimeout(() => setMonologue(null), 4000);
      setTimeout(() => {
        setPhase('playing');
      }, 3000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };
  
  if (phase !== 'puzzle') return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ cursor: 'default' }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={() => setPhase('playing')} />
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="relative bg-[#1a1a1a] border-2 border-[#333] rounded-lg p-8 shadow-2xl"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}
      >
        {solved ? (
          <div className="text-center">
            <div className="text-green-500 text-xl font-mono mb-4">✓ SAFE OPENED</div>
            <p className="text-amber-200/60 text-xs font-mono">Evidence secured...</p>
          </div>
        ) : (
          <>
            <h3 className="text-amber-500/60 text-xs uppercase tracking-[0.3em] font-mono text-center mb-6">
              Floor Safe — Enter Combination
            </h3>
            
            <div className="flex justify-center gap-6 mb-8">
              {combo.map((digit, i) => (
                <div key={i} className="flex flex-col items-center">
                  <button
                    onClick={() => adjustDigit(i, 1)}
                    className="text-amber-400 hover:text-white text-2xl font-mono mb-2"
                  >
                    ▲
                  </button>
                  <div className="w-14 h-20 bg-black/80 border-2 border-amber-500/40 flex items-center justify-center text-3xl font-mono text-amber-100 shadow-[0_0_15px_rgba(216,161,91,0.2)]">
                    {digit}
                  </div>
                  <button
                    onClick={() => adjustDigit(i, -1)}
                    className="text-amber-400 hover:text-white text-2xl font-mono mt-2"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={tryOpen}
              className="block w-full py-4 text-amber-200 bg-amber-900/20 hover:bg-amber-900/40 border-2 border-amber-600/50 hover:border-amber-400 text-sm uppercase tracking-[0.3em] font-mono transition-all"
            >
              Verify Combination
            </button>
            
            {error && (
              <p className="text-red-400 text-sm font-mono text-center mt-4 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">ACCESS DENIED: WRONG COMBINATION</p>
            )}
            
            <p className="text-amber-400/50 text-xs font-mono text-center mt-6">
              Hint: Check the gramophone record
            </p>
            
            <button
              onClick={() => setPhase('playing')}
              className="block mx-auto mt-4 text-amber-600/30 hover:text-amber-400 text-[10px] font-mono"
            >
              [ESC] Close
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Help / Controls Menu
function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const phase = useGameStore(s => s.phase);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (phase === 'loading' || phase === 'intro') return null;

  return (
    <>
      {/* Help Icon */}
      <div className="fixed top-6 right-6 z-50 flex gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full bg-black/60 border border-amber-500/40 flex items-center justify-center text-amber-400 hover:bg-amber-900/20 hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(216,161,91,0.2)] cursor-pointer pointer-events-auto"
          title="Game Controls & Info"
        >
          <span className="text-xl font-bold font-mono">?</span>
        </button>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black/80 border-2 border-amber-600/40 p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(216,161,91,0.1)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-amber-500/40 hover:text-amber-400 text-2xl font-mono transition-colors cursor-pointer"
              >
                ×
              </button>

              <div className="text-center mb-8">
                <h2 className="text-amber-400 text-3xl font-mono tracking-[0.3em] uppercase mb-2">Investigation Guide</h2>
                <div className="w-24 h-[1px] bg-amber-600/30 mx-auto" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Controls Section */}
                <div className="space-y-6">
                  <h3 className="text-amber-500/60 text-xs uppercase tracking-[0.4em] font-mono border-b border-amber-900/30 pb-2">Controls</h3>
                  <div className="space-y-3 font-mono text-sm">
                    {isMobile ? (
                      <>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Move</span>
                          <span className="text-amber-400 text-right">Joystick / Tap Floor</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Look</span>
                          <span className="text-amber-400">Drag Screen</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Interact</span>
                          <span className="text-amber-400">E Button / Tap</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Flashlight</span>
                          <span className="text-amber-400">🔦 Button</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Move</span>
                          <span className="text-amber-400">W A S D</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Look</span>
                          <span className="text-amber-400">Mouse</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Interact</span>
                          <span className="text-amber-400">E</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Flashlight</span>
                          <span className="text-amber-400">F</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Sprint / Crouch</span>
                          <span className="text-amber-400">Shift / C</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Inventory / Journal</span>
                          <span className="text-amber-400">I / J</span>
                        </div>
                        <div className="flex justify-between text-amber-100/70">
                          <span>Pause</span>
                          <span className="text-amber-400">ESC</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Game Info Section */}
                <div className="space-y-6">
                  <h3 className="text-amber-500/60 text-xs uppercase tracking-[0.4em] font-mono border-b border-amber-900/30 pb-2">Investigation</h3>
                  <p className="text-amber-100/50 text-xs font-mono leading-relaxed italic">
                    You are exploring the digital workspace of Karthikeyan VR. 
                    Search for 13 hidden pieces of evidence to uncover the man behind the machine.
                  </p>
                  <div className="pt-4">
                    <div className="text-amber-500/40 text-[10px] uppercase tracking-widest mb-3">Objective</div>
                    <p className="text-amber-100/70 text-[11px] font-mono">
                      Collect all project data and certificates to finalize the profile and solve the case.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-12 block w-full py-3 text-amber-200 bg-amber-900/20 border border-amber-600/40 hover:border-amber-400 text-[10px] uppercase tracking-[0.3em] font-mono transition-all"
              >
                Return to Game
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Film grain overlay
function FilmGrain() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-20 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '128px',
        mixBlendMode: 'overlay',
        animation: 'grain 0.5s steps(10) infinite',
      }}
    />
  );
}

// Vignette overlay
function Vignette() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
      }}
    />
  );
}

// Camera view label & return button
function CameraViewIndicator() {
  const isZoomedIn = useGameStore(s => s.isZoomedIn);
  const cameraLabel = useGameStore(s => s.cameraLabel);
  const setCameraTarget = useGameStore(s => s.setCameraTarget);
  
  if (!isZoomedIn) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 z-40"
    >
      <div className="bg-black/60 border border-amber-900/30 px-4 py-2 backdrop-blur-sm">
        {cameraLabel && (
          <div className="text-amber-600/60 text-[10px] uppercase tracking-[0.3em] font-mono mb-1">
            Viewing: {cameraLabel}
          </div>
        )}
        <button
          onClick={() => setCameraTarget(null)}
          className="text-amber-200/50 hover:text-amber-100 text-[10px] uppercase tracking-wider font-mono transition-colors"
          style={{ cursor: 'pointer' }}
        >
          [SPACE] Return to overview →
        </button>
      </div>
    </motion.div>
  );
}

export function GameHUD() {
  const phase = useGameStore(s => s.phase);
  
  if (phase === 'loading' || phase === 'intro') return null;
  
  return (
    <>
      <Crosshair />
      <InteractionPrompt />
      <Monologue />
      <ObjectiveDisplay />
      <CameraViewIndicator />
      <ControlsHint />
      <InventoryPanel />
      <JournalPanel />
      <PauseMenu />
      <ComputerTerminal />
      <SafePuzzle />
      <HelpMenu />
      <FilmGrain />
      <Vignette />
    </>
  );
}
