import { useState } from 'react';
import { Sidebar, SidebarToggle } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { TodayView } from '@/components/views/TodayView';
import { NotesView } from '@/components/views/NotesView';
import { TasksView } from '@/components/views/TasksView';
import { LinksView } from '@/components/views/LinksView';
import { DocsView } from '@/components/views/DocsView';
import { PromptsView } from '@/components/views/PromptsView';
import { SettingsView } from '@/components/views/SettingsView';
import { ArchiveView } from '@/components/views/ArchiveView';
import { FloatingActionButton } from '@/components/mobile/FloatingActionButton';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { MobileSidebar } from '@/components/mobile/MobileSidebar';
import { useAppStore } from '@/store/appStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

function MainContent() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'today':
      return <TodayView />;
    case 'notes':
      return <NotesView />;
    case 'tasks':
      return <TasksView />;
    case 'links':
      return <LinksView />;
    case 'docs':
      return <DocsView />;
    case 'prompts':
      return <PromptsView />;
    case 'settings':
      return <SettingsView />;
    case 'archive':
      return <ArchiveView />;
    default:
      return <TodayView />;
  }
}

export default function Index() {
  useKeyboardShortcuts();
  useTheme();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      {!isMobile && <SidebarToggle />}
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Mobile Header */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-card border border-border shadow-soft"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      )}
      
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 pt-16 md:pt-8 md:p-8 lg:p-12">
          <MainContent />
        </div>
      </main>
      
      <CommandPalette />
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
      <FloatingActionButton />
    </div>
  );
}
