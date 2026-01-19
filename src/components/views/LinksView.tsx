import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { 
  Link2, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Archive, 
  Copy, 
  Globe, 
  Check,
  Grid,
  List,
  LayoutGrid,
  Play,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLinkMetadata } from '@/hooks/useLinkMetadata';
import { cn } from '@/lib/utils';
import type { Link, LinkViewMode } from '@/types';
import { toast } from 'sonner';

interface LinkCardProps {
  link: Link;
  viewMode: LinkViewMode;
}

function VideoEmbed({ link, onClose }: { link: Link; onClose: () => void }) {
  if (link.videoType === 'youtube' && link.videoId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl aspect-video relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
          >
            <X className="w-6 h-6" />
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${link.videoId}?autoplay=1`}
            className="w-full h-full rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </motion.div>
    );
  }
  
  if (link.videoType === 'vimeo' && link.videoId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl aspect-video relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
          >
            <X className="w-6 h-6" />
          </button>
          <iframe
            src={`https://player.vimeo.com/video/${link.videoId}?autoplay=1`}
            className="w-full h-full rounded-xl"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </motion.div>
    );
  }
  
  return null;
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        src={src}
        alt="Preview"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-white/80"
      >
        <X className="w-6 h-6" />
      </button>
    </motion.div>
  );
}

function LinkCard({ link, viewMode }: LinkCardProps) {
  const { archiveLink, deleteLink } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [imageError, setImageError] = useState(false);

  const domain = (() => {
    try {
      return new URL(link.url).hostname.replace('www.', '');
    } catch {
      return link.url;
    }
  })();

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Left') {
        setSwipeOffset(Math.min(Math.abs(e.deltaX), 80));
      } else if (e.dir === 'Right') {
        setSwipeOffset(-Math.min(Math.abs(e.deltaX), 80));
      }
    },
    onSwipedLeft: () => {
      if (swipeOffset > 40) {
        archiveLink(link.id);
        toast.success('Link archived');
      }
      setSwipeOffset(0);
    },
    onSwipedRight: () => {
      if (Math.abs(swipeOffset) > 40) {
        handleCopy();
      }
      setSwipeOffset(0);
    },
    onTouchEndOrOnMouseUp: () => setSwipeOffset(0),
    trackMouse: false,
    trackTouch: true,
  });

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (link.isVideo) {
      setShowVideo(true);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (link.image && !imageError) {
      setShowLightbox(true);
    }
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:shadow-soft transition-all cursor-pointer"
          onClick={handleOpen}
        >
          {/* Thumbnail */}
          <div className="w-20 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
            {link.image && !imageError ? (
              <>
                <img
                  src={link.image}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                {link.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {link.favicon ? (
                  <img src={link.favicon} alt="" className="w-6 h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                ) : (
                  <Globe className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate text-sm">
              {link.title || domain}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{domain}</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={() => archiveLink(link.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {showVideo && <VideoEmbed link={link} onClose={() => setShowVideo(false)} />}
        </AnimatePresence>
      </>
    );
  }

  // Comfortable/Compact card layout
  return (
    <>
      <div {...handlers} className="relative overflow-hidden rounded-xl">
        {/* Swipe actions background */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-between px-4",
          swipeOffset > 0 ? "bg-destructive/20" : swipeOffset < 0 ? "bg-success/20" : ""
        )}>
          <Copy className="w-5 h-5 text-success" />
          <Archive className="w-5 h-5 text-destructive" />
        </div>
        
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, x: -swipeOffset }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="group rounded-xl bg-card border border-border hover:shadow-soft hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          onClick={handleOpen}
        >
          {/* Preview Image */}
          {(link.image || link.isVideo) && !imageError && (
            <div 
              className={cn(
                "w-full bg-muted relative overflow-hidden",
                viewMode === 'comfortable' ? "h-40" : "h-28"
              )}
              onClick={handleImageClick}
            >
              {link.image ? (
                <img
                  src={link.image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                  {link.favicon && <img src={link.favicon} alt="" className="w-12 h-12 opacity-50" />}
                </div>
              )}
              
              {/* Video play overlay */}
              {link.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
                  </div>
                </div>
              )}
              
              {/* Image zoom indicator */}
              {!link.isVideo && link.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className={cn("p-4", viewMode === 'compact' && "p-3")}>
            {/* Domain */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0">
                {link.favicon ? (
                  <img 
                    src={link.favicon} 
                    alt="" 
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Globe className={cn('w-4 h-4 text-muted-foreground', link.favicon && 'hidden')} />
              </div>
              <span className="text-xs text-muted-foreground truncate">{domain}</span>
            </div>
            
            {/* Title */}
            <h3 className={cn(
              "font-medium text-foreground mb-1",
              viewMode === 'comfortable' ? "line-clamp-2" : "line-clamp-1 text-sm"
            )}>
              {link.title || domain}
            </h3>
            
            {/* Description */}
            {link.description && viewMode === 'comfortable' && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {link.description}
              </p>
            )}
            
            {/* Tags */}
            {link.tags.length > 0 && viewMode === 'comfortable' && (
              <div className="flex flex-wrap gap-1 mt-2">
                {link.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); window.open(link.url, '_blank', 'noopener,noreferrer'); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </button>
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
          </div>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {showVideo && <VideoEmbed link={link} onClose={() => setShowVideo(false)} />}
        {showLightbox && link.image && <ImageLightbox src={link.image} onClose={() => setShowLightbox(false)} />}
      </AnimatePresence>
    </>
  );
}

export function LinksView() {
  const { links, addLink, updateLink } = useAppStore();
  const { fetchMetadata, parseVideoUrl, loading } = useLinkMetadata();
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<LinkViewMode>('comfortable');

  const activeLinks = links.filter(l => !l.archived);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    setIsAdding(true);
    
    try {
      const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      new URL(url);
      
      // Parse video info
      const videoInfo = parseVideoUrl(url);
      
      // Fetch metadata
      const metadata = await fetchMetadata(url);
      
      addLink({
        url,
        title: metadata.title,
        description: metadata.description,
        favicon: metadata.favicon,
        image: metadata.image,
        collection: null,
        tags: [],
        archived: false,
        isVideo: videoInfo.isVideo,
        videoType: videoInfo.videoType,
        videoId: videoInfo.videoId,
      });
      
      setNewUrl('');
      toast.success('Link saved with preview!');
    } catch {
      toast.error('Please enter a valid URL');
    } finally {
      setIsAdding(false);
    }
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Links</h1>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setViewMode('comfortable')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'comfortable' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="Comfortable view"
            >
              <LayoutGrid className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'compact' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="Compact view"
            >
              <Grid className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="List view"
            >
              <List className="w-4 h-4 text-foreground" />
            </button>
          </div>
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
              {isAdding ? 'Saving...' : 'Save'}
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

        {/* Links Grid/List */}
        <div className={cn(
          viewMode === 'list' 
            ? "space-y-2" 
            : viewMode === 'compact'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        )}>
          <AnimatePresence mode="popLayout">
            {activeLinks.map(link => (
              <LinkCard key={link.id} link={link} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
