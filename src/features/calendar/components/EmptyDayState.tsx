import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { useUIStore, useCalendarStore } from '@/shared/store';

export function EmptyDayState() {
  const { openAddTaskModal } = useUIStore();
  const { selectedDate } = useCalendarStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
      data-testid="empty-day-state"
    >
      <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
        <CalendarDays className="w-8 h-8 text-text-muted" />
      </div>

      <h3 className="text-lg font-medium text-text-primary mb-2">
        No tasks for {format(selectedDate, 'EEEE')}
      </h3>

      <p className="text-sm text-text-secondary text-center mb-6 max-w-xs">
        You don't have any tasks scheduled for {format(selectedDate, 'MMMM d')}.
        Add a task to get started.
      </p>

      <Button
        onClick={openAddTaskModal}
        className="gap-2"
        data-testid="add-task-button"
      >
        <Plus className="w-4 h-4" />
        Add a task
      </Button>
    </motion.div>
  );
}
