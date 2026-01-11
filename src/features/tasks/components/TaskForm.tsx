import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
      // Store just the date portion (YYYY-MM-DD) to avoid timezone issues
      // Adding T00:00:00 makes it a valid ISO-like format for parsing elsewhere
      const dueDateStr = `${dueDate}T00:00:00`;

      if (isEditing && task) {
        updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: dueDateStr,
          subtasks,
        });
      } else {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          dueDate: dueDateStr,
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
        <label className="text-sm font-medium text-muted-foreground">Task Name</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name..."
          className="text-base bg-[#2a2f38] placeholder:text-muted-foreground"
          data-testid="task-title-input"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Category</label>
        <CategoryPicker value={category} onChange={setCategory} />
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Due Date</label>
        <div className="relative w-full max-w-full overflow-hidden rounded-xl bg-[#2a2f38]">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10 pointer-events-none" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-transparent text-foreground text-base rounded-xl border-none outline-none appearance-none [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:opacity-0"
            data-testid="due-date-picker"
          />
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Priority</label>
        <PriorityPicker value={priority} onChange={setPriority} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
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
        className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]"
        data-testid="create-task-button"
      >
        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
      </Button>
    </form>
  );
}
