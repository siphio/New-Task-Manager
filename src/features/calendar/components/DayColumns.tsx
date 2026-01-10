import { motion } from 'framer-motion';
import { useCalendarStore } from '@/shared/store';
import { useWeekDates } from '../hooks/useWeekDates';
import { cn } from '@/shared/utils';

export function DayColumns() {
  const { setSelectedDate } = useCalendarStore();
  const days = useWeekDates();

  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {days.map((day) => (
        <button
          key={day.date.toISOString()}
          onClick={() => setSelectedDate(day.date)}
          className={cn(
            'relative flex flex-col items-center py-2 px-1 rounded-lg transition-colors',
            day.isSelected
              ? 'bg-accent-primary text-white'
              : day.isToday
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-secondary hover:bg-background-tertiary'
          )}
          data-testid={`day-column-${day.dayName.toLowerCase()}`}
        >
          <span className="text-xs font-medium">{day.dayName}</span>
          <span className="text-lg font-semibold">{day.dayNumber}</span>

          {day.taskCount > 0 && !day.isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 w-5 h-5 flex items-center justify-center text-[10px] font-medium bg-accent-primary text-white rounded-full"
            >
              {day.taskCount > 9 ? '9+' : day.taskCount}
            </motion.span>
          )}
        </button>
      ))}
    </div>
  );
}
