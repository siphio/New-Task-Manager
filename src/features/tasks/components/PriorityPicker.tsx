import { Priority } from '@/shared/types';
import { cn } from '@/shared/utils';

interface PriorityPickerProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

const priorities: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const priorityStyles: Record<Priority, { bg: string; text: string; selected: string }> = {
  low: {
    bg: 'bg-background-tertiary',
    text: 'text-text-secondary',
    selected: 'bg-text-muted text-text-primary',
  },
  medium: {
    bg: 'bg-accent-warning/20',
    text: 'text-accent-warning',
    selected: 'bg-accent-warning text-white',
  },
  high: {
    bg: 'bg-accent-error/20',
    text: 'text-accent-error',
    selected: 'bg-accent-error text-white',
  },
};

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="flex gap-2">
      {priorities.map((priority) => {
        const isSelected = value === priority.value;
        const styles = priorityStyles[priority.value];

        return (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px]',
              isSelected ? styles.selected : `${styles.bg} ${styles.text}`
            )}
            data-testid={`priority-${priority.value}`}
          >
            {priority.label}
          </button>
        );
      })}
    </div>
  );
}
