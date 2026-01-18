import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Doc } from '@/types';

interface DocEditorProps {
  doc: Doc;
  onClose: () => void;
}

function DocEditor({ doc, onClose }: DocEditorProps) {
  const { updateDoc } = useAppStore();
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content || '');

  const handleSave = () => {
    updateDoc(doc.id, { 
      title: title || 'Untitled', 
      content 
    });
    onClose();
  };

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-xl font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{wordCount} words</span>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-200px)] bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed text-lg"
            autoFocus
          />
        </div>
      </div>
    </motion.div>
  );
}

export function DocsView() {
  const { docs, addDoc, deleteDoc } = useAppStore();
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);

  const handleCreateDoc = () => {
    const now = new Date();
    const newDoc: Doc = {
      id: Math.random().toString(36).substring(2, 15),
      title: 'Untitled',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
    addDoc({ title: newDoc.title, content: newDoc.content });
    // Find the newly created doc and open it
    setTimeout(() => {
      const latestDoc = docs[0];
      if (latestDoc) setEditingDoc(latestDoc);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Docs</h1>
          </div>
          <button
            onClick={handleCreateDoc}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>

        {/* Empty State */}
        {docs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Start writing your first document.</p>
            <button
              onClick={handleCreateDoc}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              New Document
            </button>
          </div>
        )}

        {/* Docs List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {docs.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all cursor-pointer"
                onClick={() => setEditingDoc(doc)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDoc(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Full Screen Editor */}
      <AnimatePresence>
        {editingDoc && (
          <DocEditor doc={editingDoc} onClose={() => setEditingDoc(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
