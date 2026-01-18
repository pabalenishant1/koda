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
import { useAppStore } from '@/store/appStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <SidebarToggle />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 lg:p-12">
          <MainContent />
        </div>
      </main>
      
      <CommandPalette />
    </div>
  );
}
