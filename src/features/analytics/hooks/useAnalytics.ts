import { useMemo } from 'react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subDays, startOfDay, endOfDay,
  eachDayOfInterval, eachMonthOfInterval,
  format, isWithinInterval
} from 'date-fns';
import { useTaskStore, useSettingsStore } from '@/shared/store';
import { TimeFilter, AnalyticsData, CategoryStats, DayActivity } from '@/shared/types';
import { categoryColors, categoryLabels } from '@/shared/utils';
import { Category, Task } from '@/shared/types';

function getDateRange(filter: TimeFilter): { start: Date; end: Date } {
  const now = new Date();
  switch (filter) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

function getCompletedInRange(tasks: Task[], start: Date, end: Date): Task[] {
  return tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return isWithinInterval(completedDate, { start, end });
  });
}

function hasCompletedGoalOnDate(tasks: Task[], date: Date, dailyGoal: number): boolean {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const completed = tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return isWithinInterval(completedDate, { start: dayStart, end: dayEnd });
  }).length;
  return completed >= dailyGoal;
}

function calculateStreak(tasks: Task[], dailyGoal: number): number {
  let streak = 0;
  let currentDate = new Date();

  // Check if today's goal is met
  if (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak = 1;
    currentDate = subDays(currentDate, 1);
  } else {
    // Check yesterday (streak continues if missed today but hit yesterday)
    currentDate = subDays(currentDate, 1);
    if (!hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
      return 0;
    }
    streak = 1;
    currentDate = subDays(currentDate, 1);
  }

  // Count consecutive days
  while (hasCompletedGoalOnDate(tasks, currentDate, dailyGoal)) {
    streak++;
    currentDate = subDays(currentDate, 1);
  }

  return streak;
}

export function useAnalytics(filter: TimeFilter): AnalyticsData {
  const { tasks } = useTaskStore();
  const { dailyGoal, updateBestStreak } = useSettingsStore();

  return useMemo(() => {
    const { start, end } = getDateRange(filter);
    const completedTasks = getCompletedInRange(tasks, start, end);

    // Tasks completed count
    const tasksCompleted = completedTasks.length;

    // Completion rate (completed / total created in range)
    const allTasksInRange = tasks.filter(t => {
      const createdDate = new Date(t.createdAt);
      return isWithinInterval(createdDate, { start, end });
    });
    const completionRate = allTasksInRange.length > 0
      ? Math.round((completedTasks.length / allTasksInRange.length) * 100)
      : 0;

    // Current streak
    const currentStreak = calculateStreak(tasks, dailyGoal);
    updateBestStreak(currentStreak);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    const categories: Category[] = ['work', 'personal', 'team', 'self-improvement'];
    categories.forEach(cat => { categoryCounts[cat] = 0; });

    completedTasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const totalCompleted = completedTasks.length || 1; // Avoid division by zero
    const categoryBreakdown: CategoryStats[] = categories.map(cat => ({
      category: categoryLabels[cat],
      count: categoryCounts[cat],
      percentage: Math.round((categoryCounts[cat] / totalCompleted) * 100),
      color: categoryColors[cat],
    }));

    // Activity data based on filter
    const weeklyActivity: DayActivity[] = (() => {
      if (filter === 'week') {
        // Show days of the week (Mon-Sun)
        const days = eachDayOfInterval({ start, end });
        return days.map(day => {
          const dayStart = startOfDay(day);
          const dayEnd = endOfDay(day);
          const count = tasks.filter(t => {
            if (!t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return isWithinInterval(completedDate, { start: dayStart, end: dayEnd });
          }).length;
          return { day: format(day, 'EEE'), date: day.toISOString(), count };
        });
      } else if (filter === 'month') {
        // Divide month into 4 weeks (7-8 days each)
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const daysPerWeek = Math.ceil(totalDays / 4);

        return [1, 2, 3, 4].map(weekNum => {
          const weekStart = new Date(start);
          weekStart.setDate(start.getDate() + (weekNum - 1) * daysPerWeek);
          const weekEnd = new Date(start);
          weekEnd.setDate(start.getDate() + weekNum * daysPerWeek - 1);
          if (weekEnd > end) weekEnd.setTime(end.getTime());

          const count = tasks.filter(t => {
            if (!t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return completedDate >= startOfDay(weekStart) && completedDate <= endOfDay(weekEnd);
          }).length;
          return { day: `Wk ${weekNum}`, date: weekStart.toISOString(), count };
        });
      } else {
        // Year: Show months (Jan, Feb, etc.)
        const months = eachMonthOfInterval({ start, end });
        return months.map(monthStart => {
          const monthEnd = endOfMonth(monthStart);
          const count = tasks.filter(t => {
            if (!t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return isWithinInterval(completedDate, { start: monthStart, end: monthEnd });
          }).length;
          return { day: format(monthStart, 'MMM'), date: monthStart.toISOString(), count };
        });
      }
    })();

    return {
      tasksCompleted,
      completionRate,
      currentStreak,
      categoryBreakdown,
      weeklyActivity,
    };
  }, [tasks, filter, dailyGoal, updateBestStreak]);
}
