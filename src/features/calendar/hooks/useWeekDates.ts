import { useMemo } from 'react';
import { eachDayOfInterval, addDays, format, isSameDay, isToday } from 'date-fns';
import { useCalendarStore, useTaskStore } from '@/shared/store';
import { DayColumn } from '@/shared/types';

export function useWeekDates(): DayColumn[] {
  const { weekStart, selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  return useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((date) => {
      const dayTasks = tasks.filter((t) => {
        const taskDate = new Date(t.dueDate);
        return isSameDay(taskDate, date) && !t.completed;
      });

      return {
        date,
        dayName: format(date, 'EEE'),
        dayNumber: date.getDate(),
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
        taskCount: dayTasks.length,
      };
    });
  }, [weekStart, selectedDate, tasks]);
}
