import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { CategoryPicker } from './CategoryPicker';
import { PriorityPicker } from './PriorityPicker';
import { SubtaskList } from './SubtaskList';
import { Task, CreateTaskInput, Category, Priority, Subtask } from '@/shared/types';
import { useTaskStore, useUIStore } from '@/shared/store';
import { useAuth } from '@/app/providers';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { user } = useAuth();
  const { addTask, updateTask } = useTaskStore();
  const { closeTaskDrawer } = useUIStore();

  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<Category>(task?.category || 'work');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate?.split('T')[0] || format(new Date(), 'yyyy-MM-dd')
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && task) {
        updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: new Date(dueDate).toISOString(),
          subtasks,
        });
      } else {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: new Date(dueDate).toISOString(),
          subtasks: subtasks.map(s => ({ title: s.title, completed: s.completed })),
        };
        addTask(input, user?.id || 'guest-user');
      }

      closeTaskDrawer();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtaskToggle = (id: string) => {
    setSubtasks(prev =>
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    );
  };

  const handleSubtaskAdd = (title: string) => {
    setSubtasks(prev => [...prev, { id: uuidv4(), title, completed: false }]);
  };

  const handleSubtaskRemove = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name..."
          className="text-lg bg-transparent border-none px-0 placeholder:text-text-muted focus-visible:ring-0"
          data-testid="task-title-input"
          autoFocus
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <CategoryPicker value={category} onChange={setCategory} />
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label className="text-text-secondary">Due Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="pl-10 bg-background-tertiary border-none"
            data-testid="due-date-picker"
          />
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <PriorityPicker value={priority} onChange={setPriority} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes..."
          className="bg-background-tertiary border-none resize-none min-h-[80px]"
          data-testid="task-notes-input"
        />
      </div>

      {/* Subtasks */}
      <SubtaskList
        subtasks={subtasks}
        onToggle={handleSubtaskToggle}
        onAdd={handleSubtaskAdd}
        onRemove={handleSubtaskRemove}
      />

      {error && (
        <p className="text-accent-error text-sm">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white"
        data-testid="create-task-button"
      >
        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
      </Button>
    </form>
  );
}
