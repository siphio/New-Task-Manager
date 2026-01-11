import { Category } from '@/shared/types';

export const categoryColors: Record<Category, string> = {
  work: '#3b82f6',
  personal: '#22c55e',
  team: '#ec4899',
  'self-improvement': '#f59e0b',
};

export const categoryLabels: Record<Category, string> = {
  work: 'Work',
  personal: 'Personal',
  team: 'Team',
  'self-improvement': 'Self-improvement',
};

export const getCategoryColor = (category: Category): string => {
  return categoryColors[category] || categoryColors.work;
};
