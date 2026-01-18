import { motion, AnimatePresence } from 'framer-motion';
import { Archive, StickyNote, Link2, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ArchiveView() {
  const { notes, links, updateNote, updateLink, deleteNote, deleteLink } = useAppStore();
  
  const archivedNotes = notes.filter(n => n.archived);
  const archivedLinks = links.filter(l => l.archived);

  const handleRestoreNote = (id: string) => {
    updateNote(id, { archived: false });
    toast.success('Note restored');
  };

  const handleRestoreLink = (id: string) => {
    updateLink(id, { archived: false });
    toast.success('Link restored');
  };

  const isEmpty = archivedNotes.length === 0 && archivedLinks.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Archive</h1>
        </div>

        {/* Empty State */}
        {isEmpty && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No archived items. Items you archive will appear here.</p>
          </div>
        )}

        {/* Archived Notes */}
        {archivedNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Archived Notes ({archivedNotes.length})
            </h2>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {archivedNotes.map(note => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn(
                      'group flex items-center gap-4 p-4 rounded-xl',
                      note.color === 'blue' && 'bg-note-blue',
                      note.color === 'green' && 'bg-note-green',
                      note.color === 'yellow' && 'bg-note-yellow',
                      note.color === 'pink' && 'bg-note-pink',
                      note.color === 'purple' && 'bg-note-purple',
                      note.color === 'neutral' && 'bg-note-neutral'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-foreground/70 truncate">{note.content || 'Empty note'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRestoreNote(note.id)}
                        className="p-2 hover:bg-background/80 rounded-lg text-foreground/60 hover:text-foreground transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 hover:bg-background/80 rounded-lg text-foreground/60 hover:text-destructive transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Archived Links */}
        {archivedLinks.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Archived Links ({archivedLinks.length})
            </h2>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {archivedLinks.map(link => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{link.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRestoreLink(link.id)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
