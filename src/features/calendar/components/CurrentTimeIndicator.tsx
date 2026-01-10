import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentTimePosition } from '../utils/timeUtils';
import { isToday } from 'date-fns';
import { useCalendarStore } from '@/shared/store';

export function CurrentTimeIndicator() {
  const { selectedDate } = useCalendarStore();
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!isToday(selectedDate)) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      setPosition(getCurrentTimePosition());
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedDate]);

  if (position === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: position }}
      data-testid="current-time-indicator"
    >
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-accent-error" />
        <div className="flex-1 h-0.5 bg-accent-error" />
      </div>
    </motion.div>
  );
}
