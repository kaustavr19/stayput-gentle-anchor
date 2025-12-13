import { DistractionAnecdote } from '@/types';

export const distractionAnecdotes: DistractionAnecdote[] = [
  // Gentle
  { id: '1', text: "You opened YouTube. That's okay. Just don't live there.", category: 'gentle' },
  { id: '2', text: "This task still remembers you.", category: 'gentle' },
  { id: '3', text: "The rabbit hole will always be there. Your focus won't.", category: 'gentle' },
  { id: '4', text: "You're not behind. You're just... temporarily elsewhere.", category: 'gentle' },
  { id: '5', text: "The internet isn't going anywhere. Your momentum might.", category: 'gentle' },
  
  // Witty
  { id: '6', text: "Plot twist: you actually wanted to finish something today.", category: 'witty' },
  { id: '7', text: "Your browser tabs are multiplying again, aren't they?", category: 'witty' },
  { id: '8', text: "Checking Twitter won't make the deadline move.", category: 'witty' },
  { id: '9', text: "Fun fact: this task isn't going to do itself. I checked.", category: 'witty' },
  { id: '10', text: "Productivity apps won't make you productive. But you knew that.", category: 'witty' },
  
  // Wise
  { id: '11', text: "Attention is the rarest form of generosity. Be generous with yourself.", category: 'wise' },
  { id: '12', text: "The only way out is through. The only way through is now.", category: 'wise' },
  { id: '13', text: "You don't need more time. You need more presence.", category: 'wise' },
  { id: '14', text: "What you pay attention to becomes your life.", category: 'wise' },
  { id: '15', text: "Distraction is just unprocessed anxiety wearing a costume.", category: 'wise' },
  
  // More gentle
  { id: '16', text: "Still here. Whenever you're ready.", category: 'gentle' },
  { id: '17', text: "Your future self is rooting for you right now.", category: 'gentle' },
  { id: '18', text: "One small step. That's literally all it takes.", category: 'gentle' },
  { id: '19', text: "The hardest part is starting. You already did that.", category: 'gentle' },
  { id: '20', text: "Progress, not perfection. You know this.", category: 'gentle' },
];

export function getRandomAnecdote(): DistractionAnecdote {
  const index = Math.floor(Math.random() * distractionAnecdotes.length);
  return distractionAnecdotes[index];
}
