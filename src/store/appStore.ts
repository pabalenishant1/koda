import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Task, Link, Doc, Prompt, ViewType, NoteColor, Priority, PromptCategory } from '@/types';

interface AppState {
  // Navigation
  currentView: ViewType;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  
  // Data
  notes: Note[];
  tasks: Task[];
  links: Link[];
  docs: Doc[];
  prompts: Prompt[];
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions - Navigation
  setCurrentView: (view: ViewType) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Actions - Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  archiveNote: (id: string) => void;
  
  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  // Actions - Links
  addLink: (link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  archiveLink: (id: string) => void;
  
  // Actions - Docs
  addDoc: (doc: Omit<Doc, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDoc: (id: string, updates: Partial<Doc>) => void;
  deleteDoc: (id: string) => void;
  
  // Actions - Prompts
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  incrementPromptUsage: (id: string) => void;
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentView: 'today',
      sidebarOpen: true,
      commandPaletteOpen: false,
      notes: [],
      tasks: [],
      links: [],
      docs: [],
      prompts: [],
      theme: 'light',
      
      // Navigation actions
      setCurrentView: (view) => set({ currentView: view }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      // Note actions
      addNote: (noteData) => {
        const now = new Date();
        const note: Note = {
          ...noteData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [note, ...state.notes] }));
      },
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
          ),
        }));
      },
      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      },
      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date() } : n
          ),
        }));
      },
      archiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, archived: true, updatedAt: new Date() } : n
          ),
        }));
      },
      
      // Task actions
      addTask: (taskData) => {
        const now = new Date();
        const task: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tasks: [task, ...state.tasks] }));
      },
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        }));
      },
      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },
      toggleTaskComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
          ),
        }));
      },
      
      // Link actions
      addLink: (linkData) => {
        const now = new Date();
        const link: Link = {
          ...linkData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ links: [link, ...state.links] }));
      },
      updateLink: (id, updates) => {
        set((state) => ({
          links: state.links.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
          ),
        }));
      },
      deleteLink: (id) => {
        set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
      },
      archiveLink: (id) => {
        set((state) => ({
          links: state.links.map((l) =>
            l.id === id ? { ...l, archived: true, updatedAt: new Date() } : l
          ),
        }));
      },
      
      // Doc actions
      addDoc: (docData) => {
        const now = new Date();
        const doc: Doc = {
          ...docData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ docs: [doc, ...state.docs] }));
      },
      updateDoc: (id, updates) => {
        set((state) => ({
          docs: state.docs.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
          ),
        }));
      },
      deleteDoc: (id) => {
        set((state) => ({ docs: state.docs.filter((d) => d.id !== id) }));
      },
      
      // Prompt actions
      addPrompt: (promptData) => {
        const now = new Date();
        const prompt: Prompt = {
          ...promptData,
          id: generateId(),
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ prompts: [prompt, ...state.prompts] }));
      },
      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        }));
      },
      deletePrompt: (id) => {
        set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
      },
      incrementPromptUsage: (id) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, usageCount: p.usageCount + 1, updatedAt: new Date() } : p
          ),
        }));
      },
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        notes: state.notes,
        tasks: state.tasks,
        links: state.links,
        docs: state.docs,
        prompts: state.prompts,
        theme: state.theme,
        currentView: state.currentView,
      }),
    }
  )
);
