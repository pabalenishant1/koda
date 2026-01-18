export type NoteColor = 'blue' | 'green' | 'yellow' | 'pink' | 'purple' | 'neutral';
export type Priority = 'low' | 'medium' | 'high';
export type PromptCategory = 'writing' | 'coding' | 'brainstorming' | 'other';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  priority: Priority;
  project: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  collection: string | null;
  tags: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doc {
  id: string;
  title: string;
  content: any; // TipTap JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  variables: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewType = 'today' | 'notes' | 'tasks' | 'links' | 'docs' | 'prompts' | 'settings' | 'archive';
