import { create } from 'zustand';

export type GamePhase = 'loading' | 'intro' | 'playing' | 'paused' | 'inspecting' | 'computer' | 'puzzle' | 'ending';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'evidence' | 'key' | 'note' | 'photo' | 'audio';
  found: boolean;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  text: string;
  category: 'clue' | 'observation' | 'deduction' | 'dialogue';
}

export interface Objective {
  id: string;
  text: string;
  completed: boolean;
  hint?: string;
}

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  label?: string;
}

export interface GameState {
  // Core
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  
  // Camera — new free-fly system
  cameraTarget: CameraTarget | null;
  setCameraTarget: (target: CameraTarget | null) => void;
  isZoomedIn: boolean;
  setIsZoomedIn: (z: boolean) => void;
  cameraLabel: string | null;
  transitioning: boolean;
  setTransitioning: (t: boolean) => void;
  
  // Player
  flashlightOn: boolean;
  toggleFlashlight: () => void;
  
  // Inventory
  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  selectedItem: string | null;
  setSelectedItem: (id: string | null) => void;
  
  // Journal
  journal: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  
  // Objectives
  objectives: Objective[];
  completeObjective: (id: string) => void;
  currentObjective: string;
  setCurrentObjective: (text: string) => void;
  
  // Puzzle State
  puzzlesSolved: string[];
  solvePuzzle: (id: string) => void;
  
  // Interaction
  hoveredObject: string | null;
  setHoveredObject: (obj: string | null) => void;
  interactionPrompt: string | null;
  setInteractionPrompt: (prompt: string | null) => void;
  
  // Monologue
  monologue: string | null;
  setMonologue: (text: string | null) => void;
  
  // UI
  showInventory: boolean;
  toggleInventory: () => void;
  showJournal: boolean;
  toggleJournal: () => void;
  showHUD: boolean;
  setShowHUD: (show: boolean) => void;
  
  // Clue connections
  connectedClues: string[][];
  connectClues: (clueA: string, clueB: string) => void;
  
  // Environment
  rugMoved: boolean;
  setRugMoved: (moved: boolean) => void;
  safeOpened: boolean;
  setSafeOpened: (opened: boolean) => void;
  secretBookFound: boolean;
  setSecretBookFound: (found: boolean) => void;
  drawerOpened: Record<string, boolean>;
  openDrawer: (id: string) => void;
  
  // Progress
  evidenceCount: number;
  totalEvidence: number;
  
  // Save/Load
  saveGame: () => void;
  loadGame: () => boolean;
  
  // Intro
  introComplete: boolean;
  setIntroComplete: (complete: boolean) => void;
}

const INITIAL_OBJECTIVES: Objective[] = [
  { id: 'investigate_board', text: 'Analyze the project board', completed: false, hint: 'Check the connections on the left wall' },
  { id: 'check_computer', text: 'Access the dev terminal', completed: false, hint: 'The CRT monitor on the desk' },
  { id: 'find_evidence', text: 'Collect certifications from the desk', completed: false },
  { id: 'search_cabinets', text: 'Search archives for achievements', completed: false },
  { id: 'check_bookshelf', text: 'Investigate the knowledge base', completed: false },
  { id: 'find_hidden_safe', text: 'Find the source code vault', completed: false, hint: 'Something under the rug...' },
  { id: 'crack_safe', text: 'Unlock the final revelation', completed: false },
  { id: 'solve_case', text: 'Complete the developer profile', completed: false },
];

const TOTAL_EVIDENCE = 13;

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),
  
  // Camera
  cameraTarget: null,
  setCameraTarget: (target) => set({ 
    cameraTarget: target, 
    isZoomedIn: target !== null,
    cameraLabel: target?.label || null,
  }),
  isZoomedIn: false,
  setIsZoomedIn: (z) => set({ isZoomedIn: z }),
  cameraLabel: null,
  transitioning: false,
  setTransitioning: (t) => set({ transitioning: t }),
  
  // Player
  flashlightOn: true,
  toggleFlashlight: () => set((s) => ({ flashlightOn: !s.flashlightOn })),
  
  inventory: [],
  addItem: (item) => set((s) => {
    if (s.inventory.find(i => i.id === item.id)) return s;
    const newInventory = [...s.inventory, { ...item, found: true }];
    return { 
      inventory: newInventory,
      // Count all collected items as evidence for the 0/12 progress
      evidenceCount: newInventory.length
    };
  }),
  selectedItem: null,
  setSelectedItem: (id) => set({ selectedItem: id }),
  
  journal: [],
  addJournalEntry: (entry) => set((s) => {
    if (s.journal.find(j => j.id === entry.id)) return s;
    return { journal: [...s.journal, entry] };
  }),
  
  objectives: INITIAL_OBJECTIVES,
  completeObjective: (id) => set((s) => ({
    objectives: s.objectives.map(o => o.id === id ? { ...o, completed: true } : o)
  })),
  currentObjective: 'Investigate the detective office for clues',
  setCurrentObjective: (text) => set({ currentObjective: text }),
  
  puzzlesSolved: [],
  solvePuzzle: (id) => set((s) => ({
    puzzlesSolved: [...s.puzzlesSolved, id]
  })),
  
  hoveredObject: null,
  setHoveredObject: (obj) => set({ hoveredObject: obj }),
  interactionPrompt: null,
  setInteractionPrompt: (prompt) => set({ interactionPrompt: prompt }),
  
  monologue: null,
  setMonologue: (text) => set({ monologue: text }),
  
  showInventory: false,
  toggleInventory: () => set((s) => ({ showInventory: !s.showInventory })),
  showJournal: false,
  toggleJournal: () => set((s) => ({ showJournal: !s.showJournal })),
  showHUD: true,
  setShowHUD: (show) => set({ showHUD: show }),
  
  connectedClues: [],
  connectClues: (a, b) => set((s) => ({
    connectedClues: [...s.connectedClues, [a, b]]
  })),
  
  rugMoved: false,
  setRugMoved: (moved) => set({ rugMoved: moved }),
  safeOpened: false,
  setSafeOpened: (opened) => set({ safeOpened: opened }),
  secretBookFound: false,
  setSecretBookFound: (found) => set({ secretBookFound: found }),
  drawerOpened: {},
  openDrawer: (id) => set((s) => ({
    drawerOpened: { ...s.drawerOpened, [id]: true }
  })),
  
  evidenceCount: 0,
  totalEvidence: TOTAL_EVIDENCE,
  
  saveGame: () => {
    const state = get();
    const saveData = {
      inventory: state.inventory,
      journal: state.journal,
      objectives: state.objectives,
      puzzlesSolved: state.puzzlesSolved,
      connectedClues: state.connectedClues,
      rugMoved: state.rugMoved,
      safeOpened: state.safeOpened,
      secretBookFound: state.secretBookFound,
      drawerOpened: state.drawerOpened,
      evidenceCount: state.evidenceCount,
      currentObjective: state.currentObjective,
    };
    localStorage.setItem('midnight_case_save', JSON.stringify(saveData));
  },
  loadGame: () => {
    const saved = localStorage.getItem('midnight_case_save');
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      set({
        inventory: data.inventory || [],
        journal: data.journal || [],
        objectives: data.objectives || INITIAL_OBJECTIVES,
        puzzlesSolved: data.puzzlesSolved || [],
        connectedClues: data.connectedClues || [],
        rugMoved: data.rugMoved || false,
        safeOpened: data.safeOpened || false,
        secretBookFound: data.secretBookFound || false,
        drawerOpened: data.drawerOpened || {},
        evidenceCount: data.evidenceCount || 0,
        currentObjective: data.currentObjective || 'Investigate the detective office for clues',
      });
      return true;
    } catch {
      return false;
    }
  },
  
  introComplete: false,
  setIntroComplete: (complete) => set({ introComplete: complete }),
}));
