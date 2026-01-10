import { useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { PageContainer } from '@/shared/components/PageContainer';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { WeekHeader } from './components/WeekHeader';
import { DayColumns } from './components/DayColumns';
import { TimeGrid } from './components/TimeGrid';
import { UnscheduledSection } from './components/UnscheduledSection';
import { EmptyDayState } from './components/EmptyDayState';

export function CalendarScreen() {
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const hasTasksForDay = useMemo(() => {
    return tasks.some((t) => {
      if (t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  return (
    <PageContainer>
      <div className="pt-6 space-y-4" data-testid="calendar-screen">
        <WeekHeader />
        <DayColumns />

        {hasTasksForDay ? (
          <>
            <TimeGrid />
            <UnscheduledSection />
          </>
        ) : (
          <EmptyDayState />
        )}
      </div>
    </PageContainer>
  );
}
