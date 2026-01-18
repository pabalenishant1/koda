import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Monitor, Keyboard, Download, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SettingsView() {
  const { theme, setTheme, notes, tasks, links, docs, prompts } = useAppStore();

  const handleExportData = () => {
    const data = {
      notes,
      tasks,
      links,
      docs,
      prompts,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const shortcuts = [
    { keys: '⌘ K', description: 'Open command palette' },
    { keys: '⌘ /', description: 'Toggle sidebar' },
    { keys: '⌘ H', description: 'Go to Today view' },
    { keys: '⌘ 1-5', description: 'Jump to Notes/Tasks/Links/Docs/Prompts' },
    { keys: '⌘ N', description: 'New (context-aware)' },
    { keys: 'Esc', description: 'Close modals/palette' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        </div>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Appearance</h2>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    theme === 'light' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    theme === 'dark' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    theme === 'system' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Monitor className="w-4 h-4" />
                  System
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
          </h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between p-4">
                <span className="text-foreground">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Data */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Data</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Storage Used</h3>
                  <p className="text-sm text-muted-foreground">
                    {notes.length} notes • {tasks.length} tasks • {links.length} links • {docs.length} docs • {prompts.length} prompts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">About</h2>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Workspace</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
              <span className="text-xs text-muted-foreground">Built with ❤️</span>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
