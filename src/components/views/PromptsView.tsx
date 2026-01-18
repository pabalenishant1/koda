import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Copy, Trash2, X, Check, Zap } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { Prompt, PromptCategory } from '@/types';
import { toast } from 'sonner';

const categoryColors: Record<PromptCategory, string> = {
  writing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  coding: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  brainstorming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
}

function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const { deletePrompt, incrementPromptUsage } = useAppStore();
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (prompt.variables.length > 0) {
      setShowVariableModal(true);
      return;
    }
    
    await navigator.clipboard.writeText(prompt.content);
    incrementPromptUsage(prompt.id);
    setCopied(true);
    toast.success('Prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWithVariables = async () => {
    let filledContent = prompt.content;
    prompt.variables.forEach(v => {
      filledContent = filledContent.replace(new RegExp(`{{${v}}}`, 'g'), variableValues[v] || `{{${v}}}`);
    });
    
    await navigator.clipboard.writeText(filledContent);
    incrementPromptUsage(prompt.id);
    setShowVariableModal(false);
    setVariableValues({});
    toast.success('Prompt copied!');
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-foreground">{prompt.title}</h3>
          <span className={cn('text-xs px-2 py-1 rounded-full font-medium capitalize', categoryColors[prompt.category])}>
            {prompt.category}
          </span>
        </div>
        
        <pre className="text-sm text-muted-foreground font-mono bg-muted/50 rounded-lg p-3 mb-3 whitespace-pre-wrap overflow-hidden line-clamp-4">
          {prompt.content}
        </pre>
        
        {prompt.variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {prompt.variables.map(v => (
              <span key={v} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Used {prompt.usageCount} times
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => deletePrompt(prompt.id)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Variable Fill Modal */}
      <AnimatePresence>
        {showVariableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 command-backdrop flex items-center justify-center p-4"
            onClick={() => setShowVariableModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card rounded-2xl p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Fill Variables</h3>
              <div className="space-y-4 mb-6">
                {prompt.variables.map(v => (
                  <div key={v}>
                    <label className="text-sm font-medium text-foreground mb-1 block font-mono">
                      {`{{${v}}}`}
                    </label>
                    <input
                      type="text"
                      value={variableValues[v] || ''}
                      onChange={(e) => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                      placeholder={`Enter ${v}...`}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowVariableModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyWithVariables}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Fill & Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface PromptEditorProps {
  prompt?: Prompt;
  onClose: () => void;
}

function PromptEditor({ prompt, onClose }: PromptEditorProps) {
  const { addPrompt, updatePrompt } = useAppStore();
  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [category, setCategory] = useState<PromptCategory>(prompt?.category || 'other');

  // Auto-detect variables
  const detectedVariables = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  }, [content]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    if (prompt) {
      updatePrompt(prompt.id, { title, content, category, variables: detectedVariables });
    } else {
      addPrompt({ title, content, category, variables: detectedVariables });
    }
    onClose();
    toast.success(prompt ? 'Prompt updated!' : 'Prompt created!');
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
        className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {prompt ? 'Edit Prompt' : 'New Prompt'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Email outreach template..."
              className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PromptCategory)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent focus:border-primary outline-none text-foreground"
            >
              <option value="writing">Writing</option>
              <option value="coding">Coding</option>
              <option value="brainstorming">Brainstorming</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Content <span className="text-muted-foreground font-normal">(use {'{{variable}}'} for placeholders)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write an email to {{name}} about {{topic}}..."
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm resize-none"
            />
          </div>

          {detectedVariables.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Detected Variables</label>
              <div className="flex flex-wrap gap-1.5">
                {detectedVariables.map(v => (
                  <span key={v} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-mono">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PromptsView() {
  const { prompts } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [sortBy, setSortBy] = useState<'recent' | 'used' | 'alpha'>('recent');

  const sortedPrompts = useMemo(() => {
    const sorted = [...prompts];
    switch (sortBy) {
      case 'used':
        return sorted.sort((a, b) => b.usageCount - a.usageCount);
      case 'alpha':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [prompts, sortBy]);

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Prompts</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>

        {/* Sort */}
        {prompts.length > 0 && (
          <div className="flex gap-2 mb-6">
            {(['recent', 'used', 'alpha'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                  sortBy === s 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {s === 'used' ? 'Most Used' : s === 'alpha' ? 'A-Z' : 'Recent'}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {prompts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Build your prompt library. Save templates you use often.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Add Prompt
            </button>
          </div>
        )}

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onEdit={() => setEditingPrompt(prompt)}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Editor Modal */}
      <AnimatePresence>
        {(isCreating || editingPrompt) && (
          <PromptEditor
            prompt={editingPrompt}
            onClose={() => {
              setIsCreating(false);
              setEditingPrompt(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
