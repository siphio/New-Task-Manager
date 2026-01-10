import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { PageContainer } from '@/shared/components/PageContainer';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { SubtaskList } from './components/SubtaskList';
import { useTaskStore, useUIStore } from '@/shared/store';
import { getCategoryColor, categoryLabels } from '@/shared/utils';
import { cn } from '@/shared/utils';

export function TaskDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaskById, toggleTaskComplete, deleteTask, toggleSubtaskComplete } = useTaskStore();
  const { openTaskDrawer } = useUIStore();

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-text-secondary">Task not found</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </PageContainer>
    );
  }

  const categoryColor = getCategoryColor(task.category);

  const handleEdit = () => {
    openTaskDrawer(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    navigate('/');
  };

  const handleComplete = () => {
    toggleTaskComplete(task.id);
  };

  const priorityBadge = {
    low: { bg: 'bg-background-tertiary', text: 'text-text-secondary' },
    medium: { bg: 'bg-accent-warning/20', text: 'text-accent-warning' },
    high: { bg: 'bg-accent-error/20', text: 'text-accent-error' },
  }[task.priority];

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
        data-testid="task-details-screen"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Task Details</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 -mr-2 text-text-secondary hover:text-accent-error">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background-secondary border-background-tertiary">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-text-primary">Delete Task?</AlertDialogTitle>
                <AlertDialogDescription className="text-text-secondary">
                  This action cannot be undone. This will permanently delete the task.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-background-tertiary text-text-primary border-none">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-accent-error text-white"
                  data-testid="confirm-delete-button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Task Content */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-sm text-text-secondary">
                {categoryLabels[task.category]}
              </span>
            </div>
            <h2 className={cn(
              'text-2xl font-bold text-text-primary',
              task.completed && 'line-through opacity-60'
            )}>
              {task.title}
            </h2>
          </div>

          {/* Due Date & Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
            <span className={cn('text-xs px-2 py-1 rounded', priorityBadge.bg, priorityBadge.text)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="p-4 bg-background-secondary rounded-xl">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
              <p className="text-text-primary">{task.description}</p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="p-4 bg-background-secondary rounded-xl">
              <SubtaskList
                subtasks={task.subtasks}
                onToggle={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                onAdd={() => {}}
                onRemove={() => {}}
                readOnly
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-background-tertiary"
              onClick={handleEdit}
              data-testid="edit-task-button"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
            <Button
              className={cn(
                'flex-1',
                task.completed
                  ? 'bg-background-tertiary text-text-primary'
                  : 'bg-accent-success text-white'
              )}
              onClick={handleComplete}
              data-testid="mark-complete-button"
            >
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
