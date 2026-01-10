export type TimeFilter = 'week' | 'month' | 'year';

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DayActivity {
  day: string;      // 'Mon', 'Tue', etc.
  date: string;     // ISO date for reference
  count: number;    // Tasks completed
}

export interface AnalyticsData {
  tasksCompleted: number;
  completionRate: number;
  currentStreak: number;
  categoryBreakdown: CategoryStats[];
  weeklyActivity: DayActivity[];
}
