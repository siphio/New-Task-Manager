import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { Task } from '@/shared/types';
import { getCategoryColor, cn } from '@/shared/utils';

interface UnscheduledTaskItemProps {
  task: Task;
  index: number;
}

export function UnscheduledTaskItem({ task, index }: UnscheduledTaskItemProps) {
  const navigate = useNavigate();
  const categoryColor = getCategoryColor(task.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-background-tertiary hover:bg-background-tertiary/80',
        'cursor-pointer transition-colors'
      )}
      onClick={() => navigate(`/tasks/${task.id}`)}
      data-testid={`unscheduled-task-${index}`}
    >
      <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />

      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: categoryColor }}
      />

      <span className="text-sm text-text-primary truncate flex-1">
        {task.title}
      </span>

      {task.priority === 'high' && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-accent-error/20 text-accent-error flex-shrink-0">
          High
        </span>
      )}
    </motion.div>
  );
}
