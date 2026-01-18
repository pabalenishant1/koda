import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Pin, Trash2, Archive, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { Note, NoteColor } from '@/types';

const colorOptions: { id: NoteColor; label: string }[] = [
  { id: 'neutral', label: 'Gray' },
  { id: 'blue', label: 'Blue' },
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'pink', label: 'Pink' },
  { id: 'purple', label: 'Purple' },
];

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
}

function NoteCard({ note, onEdit }: NoteCardProps) {
  const { togglePinNote, archiveNote, deleteNote } = useAppStore();
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'group relative p-4 rounded-xl cursor-pointer transition-all duration-200',
        'hover:shadow-soft',
        note.color === 'blue' && 'bg-note-blue',
        note.color === 'green' && 'bg-note-green',
        note.color === 'yellow' && 'bg-note-yellow',
        note.color === 'pink' && 'bg-note-pink',
        note.color === 'purple' && 'bg-note-purple',
        note.color === 'neutral' && 'bg-note-neutral'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onEdit}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-3.5 h-3.5 text-foreground/50 fill-current" />
        </div>
      )}
      
      {/* Content */}
      {note.title && (
        <h3 className="font-medium text-foreground mb-2 pr-6">{note.title}</h3>
      )}
      <p className="text-sm text-foreground/70 line-clamp-6 whitespace-pre-wrap">
        {note.content || 'Empty note...'}
      </p>
      
      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/60">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 left-2 right-2 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => togglePinNote(note.id)}
              className="p-1.5 rounded-md bg-background/80 hover:bg-background text-foreground/60 hover:text-foreground transition-colors"
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={cn('w-3.5 h-3.5', note.pinned && 'fill-current')} />
            </button>
            <button
              onClick={() => archiveNote(note.id)}
              className="p-1.5 rounded-md bg-background/80 hover:bg-background text-foreground/60 hover:text-foreground transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteNote(note.id)}
              className="p-1.5 rounded-md bg-background/80 hover:bg-background text-foreground/60 hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface NoteEditorProps {
  note?: Note;
  onClose: () => void;
}

function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { addNote, updateNote } = useAppStore();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || 'neutral');
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') || '');

  const handleSave = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    if (note) {
      updateNote(note.id, { title, content, color, tags });
    } else {
      addNote({ title, content, color, tags, pinned: false, archived: false });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/20 command-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'w-full max-w-lg rounded-2xl p-6 shadow-elevated',
          color === 'blue' && 'bg-note-blue',
          color === 'green' && 'bg-note-green',
          color === 'yellow' && 'bg-note-yellow',
          color === 'pink' && 'bg-note-pink',
          color === 'purple' && 'bg-note-purple',
          color === 'neutral' && 'bg-card'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {colorOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setColor(opt.id)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all',
                  color === opt.id ? 'border-foreground scale-110' : 'border-transparent hover:scale-105',
                  opt.id === 'blue' && 'bg-note-blue',
                  opt.id === 'green' && 'bg-note-green',
                  opt.id === 'yellow' && 'bg-note-yellow',
                  opt.id === 'pink' && 'bg-note-pink',
                  opt.id === 'purple' && 'bg-note-purple',
                  opt.id === 'neutral' && 'bg-note-neutral'
                )}
                title={opt.label}
              />
            ))}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-foreground/10 rounded-md transition-colors">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-foreground/40 outline-none mb-3"
          autoFocus
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-48 bg-transparent text-foreground placeholder:text-foreground/40 outline-none resize-none"
        />
        
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma separated)..."
          className="w-full bg-transparent text-sm text-foreground/70 placeholder:text-foreground/40 outline-none mb-4"
        />
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NotesView() {
  const { notes } = useAppStore();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pinned'>('all');

  const activeNotes = notes.filter(n => !n.archived);
  const filteredNotes = filter === 'pinned' 
    ? activeNotes.filter(n => n.pinned) 
    : activeNotes;
  
  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === 'pinned' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            Pinned
          </button>
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <StickyNote className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              {filter === 'pinned' 
                ? 'No pinned notes yet. Pin important notes to see them here.'
                : "No notes yet. Press ⌘K or click 'New Note' to get started."}
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Create your first note
            </button>
          </div>
        )}

        {/* Notes Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {pinnedNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={() => setEditingNote(note)} 
              />
            ))}
            {unpinnedNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={() => setEditingNote(note)} 
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Editor Modal */}
      <AnimatePresence>
        {(isCreating || editingNote) && (
          <NoteEditor
            note={editingNote}
            onClose={() => {
              setIsCreating(false);
              setEditingNote(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
