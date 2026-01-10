import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TaskCard } from '@/features/tasks';
import { useTaskStore } from '@/shared/store';
import { Task } from '@/shared/types';

interface TaskListProps {
  tasks?: Task[];
  title?: string;
  emptyMessage?: string;
}

export function TaskList({
  tasks: propTasks,
  title = "Today's Tasks",
  emptyMessage = "No tasks for today. Tap + to add one!"
}: TaskListProps) {
  const navigate = useNavigate();
  // Subscribe to the tasks array directly to trigger re-renders when tasks change
  const allTasks = useTaskStore((state) => state.tasks);

  // Compute today's tasks from the subscribed tasks array
  const todaysTasks = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return allTasks.filter(
      (t) => t.dueDate.split('T')[0] === todayStr && !t.completed
    );
  }, [allTasks]);

  const tasks = propTasks || todaysTasks;

  const handleTaskPress = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>

      {tasks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task.id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
