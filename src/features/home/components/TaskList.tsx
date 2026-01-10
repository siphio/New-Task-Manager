import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  const { getTodaysTasks } = useTaskStore();

  const tasks = propTasks || getTodaysTasks();

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
