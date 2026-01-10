import { Category } from '@/shared/types';

export const categoryColors: Record<Category, string> = {
  work: '#0A84FF',
  personal: '#2DA44E',
  team: '#DB61A2',
  'self-improvement': '#D29922',
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
