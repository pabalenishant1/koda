import { motion } from 'framer-motion';
import { Sun, StickyNote, CheckSquare, Link2, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'links', label: 'Links', icon: Link2 },
];

export function MobileNavigation() {
  const { currentView, setCurrentView, setCommandPaletteOpen } = useAppStore();

  const isMoreActive = !navItems.some(item => item.id === currentView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors"
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive ? "bg-primary/10" : ""
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* More button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors"
        >
          <div className={cn(
            "p-1.5 rounded-lg transition-colors",
            isMoreActive ? "bg-primary/10" : ""
          )}>
            <MoreHorizontal className={cn(
              "w-5 h-5 transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            isMoreActive ? "text-primary" : "text-muted-foreground"
          )}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
