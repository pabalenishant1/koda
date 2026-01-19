import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Trash2, 
  X, 
  Check,
  Download,
  Maximize2,
  Minimize2,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
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
  const [wordCount, setWordCount] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      updateDoc(doc.id, { title: title || 'Untitled', content });
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, doc.id, updateDoc]);

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleExportMarkdown = useCallback(() => {
    // Convert TipTap JSON to markdown (simplified)
    let markdown = `# ${title}\n\n`;
    
    const extractText = (node: any): string => {
      if (!node) return '';
      if (typeof node === 'string') return node;
      if (node.text) return node.text;
      if (node.content) {
        return node.content.map(extractText).join('');
      }
      return '';
    };

    if (content && content.content) {
      content.content.forEach((block: any) => {
        if (block.type === 'heading') {
          const level = block.attrs?.level || 1;
          markdown += `${'#'.repeat(level)} ${extractText(block)}\n\n`;
        } else if (block.type === 'paragraph') {
          markdown += `${extractText(block)}\n\n`;
        } else if (block.type === 'bulletList') {
          block.content?.forEach((item: any) => {
            markdown += `- ${extractText(item)}\n`;
          });
          markdown += '\n';
        } else if (block.type === 'orderedList') {
          block.content?.forEach((item: any, idx: number) => {
            markdown += `${idx + 1}. ${extractText(item)}\n`;
          });
          markdown += '\n';
        } else if (block.type === 'blockquote') {
          markdown += `> ${extractText(block)}\n\n`;
        } else if (block.type === 'codeBlock') {
          markdown += `\`\`\`\n${extractText(block)}\n\`\`\`\n\n`;
        }
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, content]);

  const handleExportHTML = useCallback(() => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1, h2, h3 { line-height: 1.3; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: ui-monospace, monospace; }
    blockquote { border-left: 3px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${JSON.stringify(content)}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Untitled'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col",
        focusMode && "bg-background/95"
      )}
    >
      {/* Header */}
      <motion.div 
        initial={false}
        animate={{ opacity: focusMode ? 0 : 1, y: focusMode ? -10 : 0 }}
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-lg md:text-xl font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground flex-1 min-w-0"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>Saved {lastSaved && format(lastSaved, 'h:mm a')}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span>Error</span>
              </>
            )}
          </div>
          
          {/* Export dropdown */}
          <div className="relative group">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
              <button
                onClick={handleExportMarkdown}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-t-lg"
              >
                Export as Markdown
              </button>
              <button
                onClick={handleExportHTML}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors rounded-b-lg"
              >
                Export as HTML
              </button>
            </div>
          </div>
          
          {/* Focus mode */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title={focusMode ? "Exit focus mode" : "Focus mode"}
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Editor */}
      <div className={cn(
        "flex-1 overflow-hidden",
        focusMode && "max-w-2xl mx-auto w-full"
      )}>
        <TipTapEditor
          content={content}
          onChange={setContent}
          onWordCountChange={setWordCount}
          placeholder="Start writing..."
        />
      </div>

      {/* Footer - Word count & reading time */}
      <motion.div 
        initial={false}
        animate={{ opacity: focusMode ? 0.5 : 1 }}
        className="px-4 md:px-6 py-2 border-t border-border flex items-center justify-end gap-4 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{readingTime} min read</span>
        </div>
        <span>{wordCount.toLocaleString()} words</span>
      </motion.div>
    </motion.div>
  );
}

export function DocsView() {
  const { docs, addDoc, deleteDoc } = useAppStore();
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);

  const handleCreateDoc = () => {
    const newDocData = { title: 'Untitled', content: '' };
    addDoc(newDocData);
  };

  // Open newly created doc
  useEffect(() => {
    if (docs.length > 0 && !editingDoc) {
      const latestDoc = docs[0];
      if (latestDoc.title === 'Untitled' && !latestDoc.content) {
        setEditingDoc(latestDoc);
      }
    }
  }, [docs]);

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
