import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, StickyNote, CheckSquare, Link2, FileText, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const fabItems = [
  { id: 'note', label: 'New Note', icon: StickyNote, view: 'notes' as const },
  { id: 'task', label: 'New Task', icon: CheckSquare, view: 'tasks' as const },
  { id: 'link', label: 'New Link', icon: Link2, view: 'links' as const },
  { id: 'doc', label: 'New Doc', icon: FileText, view: 'docs' as const },
  { id: 'prompt', label: 'New Prompt', icon: Sparkles, view: 'prompts' as const },
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentView, addNote, addDoc } = useAppStore();

  const handleItemClick = (item: typeof fabItems[0]) => {
    setIsOpen(false);
    
    if (item.id === 'note') {
      addNote({ title: '', content: '', color: 'neutral', pinned: false, archived: false, tags: [] });
    } else if (item.id === 'doc') {
      addDoc({ title: 'Untitled', content: '' });
    }
    
    setCurrentView(item.view);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      {/* Speed dial menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu items */}
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3">
              {fabItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 pl-4 pr-3 py-2.5 bg-card border border-border rounded-full shadow-lg"
                  >
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{item.label}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main FAB button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
          isOpen 
            ? "bg-muted text-foreground" 
            : "bg-primary text-primary-foreground"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
