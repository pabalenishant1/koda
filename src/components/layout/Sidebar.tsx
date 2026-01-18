import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  StickyNote, 
  CheckSquare, 
  Link2, 
  FileText, 
  Sparkles, 
  Settings, 
  Archive,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

const navItems: { id: ViewType; label: string; icon: React.ElementType; shortcut?: string }[] = [
  { id: 'today', label: 'Today', icon: Sun, shortcut: '⌘H' },
  { id: 'notes', label: 'Notes', icon: StickyNote, shortcut: '⌘1' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, shortcut: '⌘2' },
  { id: 'links', label: 'Links', icon: Link2, shortcut: '⌘3' },
  { id: 'docs', label: 'Docs', icon: FileText, shortcut: '⌘4' },
  { id: 'prompts', label: 'Prompts', icon: Sparkles, shortcut: '⌘5' },
];

const bottomItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { 
    currentView, 
    setCurrentView, 
    sidebarOpen, 
    toggleSidebar,
    setCommandPaletteOpen 
  } = useAppStore();

  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-screen flex-shrink-0 border-r border-sidebar-border bg-sidebar overflow-hidden"
        >
          <div className="flex flex-col h-full p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Workspace</h1>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1 mb-6">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Create</span>
                <kbd className="ml-auto text-[10px] font-medium text-sidebar-foreground/40 bg-sidebar-accent px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.shortcut && !isActive && (
                      <kbd className="ml-auto text-[10px] font-medium text-sidebar-foreground/30">{item.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-sidebar-border pt-3 mt-3 space-y-0.5">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function SidebarToggle() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  if (sidebarOpen) return null;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border border-border shadow-soft hover:shadow-medium transition-all"
    >
      <PanelLeft className="w-4 h-4 text-muted-foreground" />
    </motion.button>
  );
}
