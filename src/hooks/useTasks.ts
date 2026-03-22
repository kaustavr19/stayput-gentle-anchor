import { useState, useEffect, useCallback } from 'react';
import { awardTaskXP } from './useLeaderboard';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Task } from '@/types';

export interface GoalGroup {
  id: string;
  text: string;
  tasks: Task[];
}

export function useTasks() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const col = collection(db, 'users', user.uid, 'tasks');
    const q = query(col, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, snap => {
      const all: Task[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          goalId: data.goalId as string,
          goalText: data.goalText as string,
          text: data.text as string,
          status: data.status as Task['status'],
          order: data.order as number,
          createdAt: (data.createdAt as Timestamp).toDate(),
        };
      });

      // Group by goalId; preserve goal insertion order (newest first)
      const map = new Map<string, GoalGroup>();
      for (const task of all) {
        if (!map.has(task.goalId)) {
          map.set(task.goalId, { id: task.goalId, text: task.goalText, tasks: [] });
        }
        map.get(task.goalId)!.tasks.push(task);
      }
      // Sort groups: most recently created goal first (by first task's createdAt)
      const groups = Array.from(map.values()).sort(
        (a, b) => (b.tasks[0]?.createdAt?.getTime() ?? 0) - (a.tasks[0]?.createdAt?.getTime() ?? 0),
      );
      setGoals(groups);
      setIsLoading(false);
    });

    return unsub;
  }, [user]);

  /** Write a full set of tasks for a new goal in one batch. */
  const addGoalTasks = useCallback(async (
    goalId: string,
    goalText: string,
    steps: string[],
  ): Promise<void> => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'tasks');
    for (let i = 0; i < steps.length; i++) {
      await addDoc(col, {
        goalId,
        goalText,
        text: steps[i],
        status: 'pending',
        order: i,
        createdAt: Timestamp.now(),
      });
    }
  }, [user]);

  const updateTaskStatus = useCallback(async (
    taskId: string,
    status: Task['status'],
  ): Promise<void> => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { status });
    // Award XP when a task is completed
    if (status === 'done') {
      const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous';
      awardTaskXP(user.uid, displayName, user.photoURL ?? null).catch(
        err => console.error('[StayPut] Task XP award failed', err),
      );
    }
  }, [user]);

  /** Delete all tasks belonging to a goal. */
  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    if (!user) return;
    const group = goals.find(g => g.id === goalId);
    if (!group) return;
    for (const task of group.tasks) {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', task.id));
    }
  }, [user, goals]);

  return { goals, isLoading, addGoalTasks, updateTaskStatus, deleteGoal };
}
