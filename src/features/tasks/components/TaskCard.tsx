import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Task } from '@/shared/types';
import { getCategoryColor } from '@/shared/utils';
import { cn } from '@/shared/utils';
import { useTaskStore } from '@/shared/store';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { toggleTaskComplete } = useTaskStore();
  const categoryColor = getCategoryColor(task.category);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskComplete(task.id);
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isDueSoon = isPast(new Date(task.dueDate)) && !task.completed;

  const subtaskProgress = task.subtasks.length > 0
    ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        'p-4 bg-background-secondary rounded-xl',
        'flex items-start gap-3 cursor-pointer',
        'hover:bg-background-tertiary/50 transition-colors',
        task.completed && 'opacity-60'
      )}
      onClick={onPress}
      data-testid={`task-card-${task.id}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckboxClick}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5',
          task.completed
            ? 'bg-accent-success border-accent-success'
            : 'border-text-muted hover:border-accent-primary'
        )}
        data-testid={`task-checkbox-${task.id}`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            'font-medium text-text-primary truncate',
            task.completed && 'line-through text-text-muted'
          )}>
            {task.title}
          </h3>
          {subtaskProgress && (
            <span className="text-xs text-text-secondary shrink-0">
              {subtaskProgress}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {/* Category indicator */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />

          {/* Due date */}
          <span className={cn(
            'text-xs',
            isDueSoon ? 'text-accent-error' : 'text-text-secondary'
          )}>
            {formatDueDate(task.dueDate)}
          </span>

          {/* Priority badge */}
          {task.priority === 'high' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent-error/20 text-accent-error">
              High
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
