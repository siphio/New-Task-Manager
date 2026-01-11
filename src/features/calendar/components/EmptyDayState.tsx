import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { useUIStore, useCalendarStore } from '@/shared/store';

export function EmptyDayState() {
  const { openAddTaskModal } = useUIStore();
  const { selectedDate } = useCalendarStore();

  const dayName = format(selectedDate, 'EEEE');
  const fullDate = format(selectedDate, 'MMMM d');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-[#222830] rounded-2xl text-center"
      data-testid="empty-day-state"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
        <CalendarDays className="w-8 h-8 text-primary" />
      </div>

      <h3 className="text-xl text-foreground font-semibold mb-3">
        No tasks for {dayName}
      </h3>

      <p className="text-muted-foreground text-sm mb-6 max-w-[280px] mx-auto">
        You don't have any tasks scheduled for {fullDate}. Add a task to get started.
      </p>

      <Button
        onClick={openAddTaskModal}
        className="bg-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)] px-6"
        data-testid="add-task-button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a task
      </Button>
    </motion.div>
  );
}
