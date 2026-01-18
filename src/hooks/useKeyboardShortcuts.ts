import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

export function useKeyboardShortcuts() {
  const { setCommandPaletteOpen, toggleSidebar, setCurrentView, commandPaletteOpen } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Command palette is handled separately in CommandPalette component
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        return;
      }
      
      // Only handle shortcuts when not typing (except for specific ones)
      if (isTyping && !commandPaletteOpen) return;
      
      const key = e.key.toLowerCase();
      
      // Toggle sidebar: Cmd/Ctrl + /
      if ((e.metaKey || e.ctrlKey) && key === '/') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      
      // Navigation shortcuts: Cmd/Ctrl + number
      if (e.metaKey || e.ctrlKey) {
        switch (key) {
          case 'h':
            e.preventDefault();
            setCurrentView('today');
            break;
          case '1':
            e.preventDefault();
            setCurrentView('notes');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('tasks');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('links');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('docs');
            break;
          case '5':
            e.preventDefault();
            setCurrentView('prompts');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, toggleSidebar, setCurrentView, commandPaletteOpen]);
}
