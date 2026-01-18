import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, ExternalLink, Trash2, Archive, Copy, Globe, Check } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { Link } from '@/types';
import { toast } from 'sonner';

interface LinkCardProps {
  link: Link;
}

function LinkCard({ link }: LinkCardProps) {
  const { archiveLink, deleteLink } = useAppStore();
  const [copied, setCopied] = useState(false);

  const domain = (() => {
    try {
      return new URL(link.url).hostname.replace('www.', '');
    } catch {
      return link.url;
    }
  })();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all cursor-pointer"
      onClick={handleOpen}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {link.favicon ? (
            <img 
              src={link.favicon} 
              alt="" 
              className="w-5 h-5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Globe className={cn('w-5 h-5 text-muted-foreground', link.favicon && 'hidden')} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate mb-1">
            {link.title || domain}
          </h3>
          {link.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {link.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{domain}</span>
          </div>
        </div>
      </div>
      
      {/* Tags */}
      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {link.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={() => archiveLink(link.id)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteLink(link.id)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function LinksView() {
  const { links, addLink } = useAppStore();
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const activeLinks = links.filter(l => !l.archived);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    setIsAdding(true);
    
    try {
      // Basic URL validation
      const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      new URL(url); // Validate URL format
      
      // Extract domain for title
      const domain = new URL(url).hostname.replace('www.', '');
      
      addLink({
        url,
        title: domain,
        description: '',
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        collection: null,
        tags: [],
        archived: false,
      });
      
      setNewUrl('');
      toast.success('Link saved!');
    } catch {
      toast.error('Please enter a valid URL');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Links</h1>
        </div>

        {/* Add Link Form */}
        <form onSubmit={handleAddLink} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Paste a URL..."
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!newUrl.trim() || isAdding}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Save
            </button>
          </div>
        </form>

        {/* Empty State */}
        {activeLinks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">Save your first link to start building your library.</p>
            <p className="text-sm text-muted-foreground">Paste a URL above to get started.</p>
          </div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {activeLinks.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
