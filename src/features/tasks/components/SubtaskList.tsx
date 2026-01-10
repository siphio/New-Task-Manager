import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Subtask } from '@/shared/types';
import { cn } from '@/shared/utils';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export function SubtaskList({
  subtasks,
  onToggle,
  onAdd,
  onRemove,
  readOnly = false
}: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd(newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Subtasks</span>
        {subtasks.length > 0 && (
          <span className="text-sm text-text-secondary">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-3 group"
          >
            <Checkbox
              id={`subtask-${subtask.id}`}
              checked={subtask.completed}
              onCheckedChange={() => onToggle(subtask.id)}
              data-testid={`subtask-checkbox-${subtask.id}`}
            />
            <label
              htmlFor={`subtask-${subtask.id}`}
              className={cn(
                'flex-1 text-sm cursor-pointer',
                subtask.completed
                  ? 'text-text-muted line-through'
                  : 'text-text-primary'
              )}
            >
              {subtask.title}
            </label>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemove(subtask.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-accent-error transition-all"
                aria-label="Remove subtask"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a subtask..."
            className="flex-1 bg-background-tertiary border-none"
            data-testid="subtask-input"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
            data-testid="add-subtask-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
