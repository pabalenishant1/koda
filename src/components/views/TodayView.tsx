import { motion } from 'framer-motion';
import { Sun, CheckCircle2, Circle, StickyNote, FileText, Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';

export function TodayView() {
  const { tasks, notes, docs, toggleTaskComplete, setCurrentView, setCommandPaletteOpen } = useAppStore();
  
  const todayTasks = tasks.filter(t => 
    !t.completed && t.dueDate && (isToday(new Date(t.dueDate)) || isPast(new Date(t.dueDate)))
  );
  const pinnedNotes = notes.filter(n => n.pinned && !n.archived).slice(0, 3);
  const recentDocs = [...docs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const todayDocs = docs.filter(d => isToday(new Date(d.updatedAt))).length;

  const isEmpty = todayTasks.length === 0 && pinnedNotes.length === 0 && recentDocs.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Today</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {!isEmpty && (
          <div className="flex gap-4 mb-8 text-sm text-muted-foreground">
            <span>{pendingTasks} tasks pending</span>
            <span>•</span>
            <span>{todayDocs} docs updated today</span>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">All caught up! ✨</h2>
            <p className="text-muted-foreground mb-6">You have nothing due today. Time to create something new!</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCurrentView('tasks')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Create Task
              </button>
              <button
                onClick={() => setCurrentView('notes')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
              >
                Create Note
              </button>
            </div>
          </motion.div>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Due Today & Overdue</h2>
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {todayTasks.map((task, idx) => {
                const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-soft transition-shadow"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <span className="flex-1 text-foreground">{task.title}</span>
                    {task.dueDate && (
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-md',
                        isOverdue 
                          ? 'text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400' 
                          : 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400'
                      )}>
                        {isOverdue ? 'Overdue' : 'Today'}
                      </span>
                    )}
                    {task.priority !== 'medium' && (
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        task.priority === 'high' ? 'bg-priority-high' : 'bg-priority-low'
                      )} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pinned Notes</h2>
              <button 
                onClick={() => setCurrentView('notes')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pinnedNotes.map((note, idx) => (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setCurrentView('notes')}
                  className={cn(
                    'p-4 rounded-xl text-left hover:shadow-soft transition-all',
                    note.color === 'blue' && 'bg-note-blue',
                    note.color === 'green' && 'bg-note-green',
                    note.color === 'yellow' && 'bg-note-yellow',
                    note.color === 'pink' && 'bg-note-pink',
                    note.color === 'purple' && 'bg-note-purple',
                    note.color === 'neutral' && 'bg-note-neutral'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-foreground/60" />
                    {note.title && (
                      <span className="font-medium text-sm text-foreground truncate">{note.title}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 line-clamp-3">
                    {note.content || 'Empty note'}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Docs */}
        {recentDocs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent Documents</h2>
              <button 
                onClick={() => setCurrentView('docs')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {recentDocs.map((doc, idx) => (
                <motion.button
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setCurrentView('docs')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-soft transition-shadow text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {format(new Date(doc.updatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
