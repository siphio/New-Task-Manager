import { motion, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/shared/types';
import { CALENDAR_CONFIG } from '@/shared/types';
import { getCategoryColor, cn } from '@/shared/utils';
import { useTaskStore } from '@/shared/store';
import { getTopPosition, getTaskHeight, positionToTime, formatTimeRange } from '../utils/timeUtils';

interface ScheduledTaskBlockProps {
  task: Task;
  gridRef: React.RefObject<HTMLDivElement | null>;
  index: number;
  overlapCount: number;
  overlapIndex: number;
}

export function ScheduledTaskBlock({
  task,
  gridRef,
  index,
  overlapCount,
  overlapIndex,
}: ScheduledTaskBlockProps) {
  const navigate = useNavigate();
  const { updateTask } = useTaskStore();
  const categoryColor = getCategoryColor(task.category);

  if (!task.scheduledTime) return null;

  const top = getTopPosition(task.scheduledTime.start);
  const height = getTaskHeight(task.scheduledTime.start, task.scheduledTime.end);
  const width = overlapCount > 1 ? `${100 / overlapCount}%` : '100%';
  const left = overlapCount > 1 ? `${(100 / overlapCount) * overlapIndex}%` : '0';

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const newY = top + info.offset.y;
    const clampedY = Math.max(0, Math.min(newY, gridRect.height - height));

    const baseDate = new Date(task.dueDate);
    const { start, end } = positionToTime(clampedY, baseDate);

    updateTask(task.id, {
      scheduledTime: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return;
    navigate(`/tasks/${task.id}`);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={gridRef}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
      className={cn(
        'absolute rounded-lg p-2 cursor-grab active:cursor-grabbing overflow-hidden',
        'border-l-4 bg-background-secondary hover:bg-background-tertiary transition-colors'
      )}
      style={{
        top,
        height: Math.max(height, CALENDAR_CONFIG.SLOT_HEIGHT),
        width,
        left,
        borderLeftColor: categoryColor,
      }}
      data-testid={`scheduled-task-${index}`}
    >
      <div className="text-sm font-medium text-text-primary truncate">
        {task.title}
      </div>
      {height >= 50 && (
        <div className="text-xs text-text-secondary mt-0.5">
          {formatTimeRange(task.scheduledTime.start, task.scheduledTime.end)}
        </div>
      )}
    </motion.div>
  );
}
