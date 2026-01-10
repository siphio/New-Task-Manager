import { useRef, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useTaskStore, useCalendarStore } from '@/shared/store';
import { TimeSlot } from './TimeSlot';
import { ScheduledTaskBlock } from './ScheduledTaskBlock';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { generateTimeSlots, getGridHeight } from '../utils/timeUtils';
import { Task } from '@/shared/types';

function detectOverlaps(tasks: Task[]): Map<string, { count: number; index: number }> {
  const overlaps = new Map<string, { count: number; index: number }>();

  tasks.forEach((task, i) => {
    if (!task.scheduledTime) return;
    const start1 = new Date(task.scheduledTime.start).getTime();
    const end1 = new Date(task.scheduledTime.end).getTime();

    const overlapGroup: string[] = [task.id];

    tasks.forEach((other, j) => {
      if (i === j || !other.scheduledTime) return;
      const start2 = new Date(other.scheduledTime.start).getTime();
      const end2 = new Date(other.scheduledTime.end).getTime();

      if (start1 < end2 && end1 > start2) {
        overlapGroup.push(other.id);
      }
    });

    const uniqueGroup = [...new Set(overlapGroup)].sort();
    const index = uniqueGroup.indexOf(task.id);
    overlaps.set(task.id, { count: uniqueGroup.length, index });
  });

  return overlaps;
}

export function TimeGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { selectedDate } = useCalendarStore();
  const { tasks } = useTaskStore();

  const slots = useMemo(() => generateTimeSlots(), []);

  const scheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.scheduledTime || t.completed) return false;
      const taskDate = new Date(t.dueDate);
      return isSameDay(taskDate, selectedDate);
    });
  }, [tasks, selectedDate]);

  const overlaps = useMemo(() => detectOverlaps(scheduledTasks), [scheduledTasks]);

  return (
    <div className="bg-background-secondary rounded-xl overflow-hidden">
      <ScrollArea className="h-[400px]">
        <div
          ref={gridRef}
          className="relative ml-14 mr-2"
          style={{ height: getGridHeight() }}
        >
          {/* Time slots (background) */}
          <div className="absolute inset-0">
            {slots.map((slot) => (
              <TimeSlot key={`${slot.hour}:${slot.minute}`} slot={slot} />
            ))}
          </div>

          {/* Current time indicator */}
          <CurrentTimeIndicator />

          {/* Scheduled tasks */}
          {scheduledTasks.map((task, index) => {
            const overlap = overlaps.get(task.id) || { count: 1, index: 0 };
            return (
              <ScheduledTaskBlock
                key={task.id}
                task={task}
                gridRef={gridRef}
                index={index}
                overlapCount={overlap.count}
                overlapIndex={overlap.index}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
