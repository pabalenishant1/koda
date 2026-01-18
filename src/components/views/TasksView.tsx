import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Circle, CheckCircle2, Calendar, Trash2, Plus } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { format, isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, Priority } from '@/types';

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskComplete, updateTask, deleteTask } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      updateTask(task.id, { title: editedTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all',
        'hover:bg-muted/50 hover:border-border'
      )}
    >
      <button
        onClick={() => toggleTaskComplete(task.id)}
        className={cn(
          'flex-shrink-0 transition-colors',
          task.completed ? 'text-success' : 'text-muted-foreground hover:text-primary'
        )}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>
      
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          className="flex-1 bg-transparent outline-none text-foreground"
          autoFocus
        />
      ) : (
        <span 
          onClick={() => !task.completed && setIsEditing(true)}
          className={cn(
            'flex-1 cursor-text',
            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {task.title}
        </span>
      )}
      
      {task.dueDate && !task.completed && (
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1',
          isOverdue && 'text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400',
          isDueToday && 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
          !isOverdue && !isDueToday && 'text-muted-foreground bg-muted'
        )}>
          <Calendar className="w-3 h-3" />
          {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
      
      {task.priority !== 'medium' && !task.completed && (
        <div className={cn(
          'w-2 h-2 rounded-full',
          task.priority === 'high' ? 'bg-priority-high' : 'bg-priority-low'
        )} />
      )}
      
      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function TasksView() {
  const { tasks, addTask } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : null,
      priority: newTaskPriority,
      project: null,
      tags: [],
    });
    
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskPriority('medium');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Group tasks
  const overdueTasks = filteredTasks.filter(t => !t.completed && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const todayTasks = filteredTasks.filter(t => !t.completed && t.dueDate && isToday(new Date(t.dueDate)));
  const upcomingTasks = filteredTasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const date = new Date(t.dueDate);
    return isFuture(date) && isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 7) });
  });
  const laterTasks = filteredTasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    return isFuture(new Date(t.dueDate)) && !upcomingTasks.includes(t);
  });
  const noDueDateTasks = filteredTasks.filter(t => !t.completed && !t.dueDate);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const TaskGroup = ({ title, tasks, className }: { title: string; tasks: Task[]; className?: string }) => {
    if (tasks.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className={cn('text-xs font-medium uppercase tracking-wide mb-2', className || 'text-muted-foreground')}>
          {title} ({tasks.length})
        </h3>
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className="w-full px-4 py-3 rounded-xl bg-muted border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-muted border border-transparent focus:border-primary text-foreground text-sm"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
              className="px-3 py-2 rounded-xl bg-muted border border-transparent focus:border-primary text-foreground text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-muted-foreground">
              {filter === 'completed' 
                ? 'No completed tasks yet.' 
                : 'All done! 🎉 No tasks at the moment.'}
            </p>
          </div>
        )}

        {/* Task Groups */}
        <TaskGroup title="Overdue" tasks={overdueTasks} className="text-destructive" />
        <TaskGroup title="Today" tasks={todayTasks} className="text-warning" />
        <TaskGroup title="Upcoming (7 days)" tasks={upcomingTasks} />
        <TaskGroup title="Later" tasks={laterTasks} />
        <TaskGroup title="No due date" tasks={noDueDateTasks} />
        {filter !== 'active' && <TaskGroup title="Completed" tasks={completedTasks} />}
      </motion.div>
    </div>
  );
}
