import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { isSameDay } from 'date-fns';
import { CalendarX2 } from 'lucide-react';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { UnscheduledTaskItem } from './UnscheduledTaskItem';

export function UnscheduledSection() {
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed || t.scheduledTime) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  if (unscheduledTasks.length === 0) return null;

  return (
    <div className="bg-background-secondary rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarX2 className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-primary">
          Unscheduled
        </span>
        <span className="text-xs text-text-muted">
          ({unscheduledTasks.length})
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {unscheduledTasks.map((task, index) => (
            <UnscheduledTaskItem key={task.id} task={task} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
