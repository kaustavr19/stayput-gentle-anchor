import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

// ─── Conversion helpers ────────────────────────────────────────────────────

function toFirestore(note: Note) {
  return {
    content:         note.content,
    details:         note.details ?? null,
    isParked:        note.isParked ?? false,
    linkedSessionId: note.linkedSessionId ?? null,
    createdAt:       Timestamp.fromDate(new Date(note.createdAt)),
    updatedAt:       Timestamp.fromDate(new Date(note.updatedAt ?? note.createdAt)),
  };
}

function fromFirestore(id: string, data: Record<string, unknown>): Note {
  const toDate = (v: unknown) => v instanceof Timestamp ? v.toDate() : new Date(v as string);
  return {
    id,
    content:         data.content as string,
    details:         (data.details as string | null) ?? undefined,
    isParked:        (data.isParked as boolean) ?? false,
    linkedSessionId: (data.linkedSessionId as string | null) ?? undefined,
    createdAt:       toDate(data.createdAt),
    updatedAt:       data.updatedAt ? toDate(data.updatedAt) : undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  const notesCol = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'notes');
  }, [user]);

  const noteDoc = useCallback((id: string) => {
    if (!user) throw new Error('Not authenticated');
    return doc(db, 'users', user.uid, 'notes', id);
  }, [user]);

  // ── Load notes ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const q = query(notesCol(), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setNotes(snap.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>)));
    };

    load();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── addNote ────────────────────────────────────────────────────────────
  const addNote = useCallback(async (content: string, linkedSessionId?: string) => {
    if (!content.trim() || !user) return;

    const now = new Date();
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
      isParked: false,
      linkedSessionId,
    };

    setNotes(prev => [newNote, ...prev]);
    await setDoc(noteDoc(newNote.id), toFirestore(newNote));
    return newNote;
  }, [user, noteDoc]);

  // ── deleteNote ─────────────────────────────────────────────────────────
  const deleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await deleteDoc(noteDoc(id));
  }, [noteDoc]);

  // ── updateNote ─────────────────────────────────────────────────────────
  const updateNote = useCallback(async (id: string, content: string, details?: string) => {
    const now = new Date();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, details, updatedAt: now } : n));
    await setDoc(noteDoc(id), {
      content,
      details: details ?? null,
      updatedAt: Timestamp.fromDate(now),
    }, { merge: true });
  }, [noteDoc]);

  // ── toggleParked ───────────────────────────────────────────────────────
  const toggleParked = useCallback(async (id: string) => {
    const now = new Date();
    let newParked = false;
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      newParked = !n.isParked;
      return { ...n, isParked: newParked, updatedAt: now };
    }));
    await setDoc(noteDoc(id), { isParked: newParked, updatedAt: Timestamp.fromDate(now) }, { merge: true });
  }, [noteDoc]);

  // ── linkToSession ──────────────────────────────────────────────────────
  const linkToSession = useCallback(async (noteId: string, sessionId: string | null) => {
    const now = new Date();
    setNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, linkedSessionId: sessionId ?? undefined, updatedAt: now } : n)
    );
    await setDoc(noteDoc(noteId), {
      linkedSessionId: sessionId,
      updatedAt: Timestamp.fromDate(now),
    }, { merge: true });
  }, [noteDoc]);

  // ── getParkedNotes ─────────────────────────────────────────────────────
  const getParkedNotes = useCallback(() => notes.filter(n => n.isParked), [notes]);

  return { notes, addNote, deleteNote, updateNote, toggleParked, linkToSession, getParkedNotes };
}
