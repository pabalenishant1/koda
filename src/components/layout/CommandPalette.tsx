import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  StickyNote, 
  CheckSquare, 
  Link2, 
  FileText, 
  Sparkles, 
  Sun,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  group: 'create' | 'navigate' | 'search';
  keywords?: string[];
}

export function CommandPalette() {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    setCurrentView,
    addNote,
    addTask,
    addLink,
    addDoc,
    addPrompt,
    notes,
    tasks,
    links,
    docs,
    prompts
  } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => [
    // Create commands
    {
      id: 'new-note',
      label: 'New Note',
      description: 'Create a new note',
      icon: StickyNote,
      action: () => {
        addNote({ title: '', content: '', color: 'neutral', pinned: false, archived: false, tags: [] });
        setCurrentView('notes');
        setCommandPaletteOpen(false);
      },
      group: 'create',
      keywords: ['note', 'n', 'create', 'new'],
    },
    {
      id: 'new-task',
      label: 'New Task',
      description: 'Create a new task',
      icon: CheckSquare,
      action: () => {
        setCurrentView('tasks');
        setCommandPaletteOpen(false);
      },
      group: 'create',
      keywords: ['task', 't', 'todo', 'create', 'new'],
    },
    {
      id: 'new-link',
      label: 'New Link',
      description: 'Save a new link',
      icon: Link2,
      action: () => {
        setCurrentView('links');
        setCommandPaletteOpen(false);
      },
      group: 'create',
      keywords: ['link', 'l', 'bookmark', 'url', 'create', 'new'],
    },
    {
      id: 'new-doc',
      label: 'New Document',
      description: 'Create a new document',
      icon: FileText,
      action: () => {
        addDoc({ title: 'Untitled', content: null });
        setCurrentView('docs');
        setCommandPaletteOpen(false);
      },
      group: 'create',
      keywords: ['doc', 'd', 'document', 'create', 'new'],
    },
    {
      id: 'new-prompt',
      label: 'New Prompt',
      description: 'Create a new prompt template',
      icon: Sparkles,
      action: () => {
        setCurrentView('prompts');
        setCommandPaletteOpen(false);
      },
      group: 'create',
      keywords: ['prompt', 'p', 'template', 'create', 'new'],
    },
    // Navigate commands
    {
      id: 'go-today',
      label: 'Go to Today',
      icon: Sun,
      action: () => { setCurrentView('today'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['today', 'home', 'h'],
    },
    {
      id: 'go-notes',
      label: 'Go to Notes',
      icon: StickyNote,
      action: () => { setCurrentView('notes'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['notes'],
    },
    {
      id: 'go-tasks',
      label: 'Go to Tasks',
      icon: CheckSquare,
      action: () => { setCurrentView('tasks'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['tasks', 'todos'],
    },
    {
      id: 'go-links',
      label: 'Go to Links',
      icon: Link2,
      action: () => { setCurrentView('links'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['links', 'bookmarks'],
    },
    {
      id: 'go-docs',
      label: 'Go to Docs',
      icon: FileText,
      action: () => { setCurrentView('docs'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['docs', 'documents'],
    },
    {
      id: 'go-prompts',
      label: 'Go to Prompts',
      icon: Sparkles,
      action: () => { setCurrentView('prompts'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['prompts'],
    },
    {
      id: 'go-settings',
      label: 'Go to Settings',
      icon: Settings,
      action: () => { setCurrentView('settings'); setCommandPaletteOpen(false); },
      group: 'navigate',
      keywords: ['settings', 'preferences'],
    },
  ], [addNote, addDoc, setCurrentView, setCommandPaletteOpen]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }, [query, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      
      if (commandPaletteOpen) {
        if (e.key === 'Escape') {
          setCommandPaletteOpen(false);
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/20 command-backdrop"
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="bg-popover border border-border rounded-2xl shadow-command overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  autoFocus
                />
                <kbd className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
                {Object.entries(groupedCommands).map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {group === 'create' ? 'Create' : group === 'navigate' ? 'Navigate' : 'Results'}
                    </div>
                    {items.map((item, idx) => {
                      const Icon = item.icon;
                      const globalIndex = filteredCommands.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                            )}
                          </div>
                          {isSelected && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
                
                {filteredCommands.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No results found for "{query}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
