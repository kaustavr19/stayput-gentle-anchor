import { useCallback } from 'react';
import { Note } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('stayput-notes', []);

  const addNote = useCallback((content: string, linkedSessionId?: string) => {
    if (!content.trim()) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: new Date(),
      isParked: false,
      linkedSessionId,
    };
    
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => 
      prev.map(n => n.id === id ? { ...n, content } : n)
    );
  }, [setNotes]);

  const toggleParked = useCallback((id: string) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, isParked: !n.isParked } : n)
    );
  }, [setNotes]);

  const getParkedNotes = useCallback(() => {
    return notes.filter(n => n.isParked);
  }, [notes]);

  return {
    notes,
    addNote,
    deleteNote,
    updateNote,
    toggleParked,
    getParkedNotes,
  };
}
