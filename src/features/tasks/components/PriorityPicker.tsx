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

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="flex gap-0 bg-[#2a2f38] rounded-xl p-1">
      {priorities.map((priority) => {
        const isSelected = value === priority.value;

        return (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all min-h-[44px]',
              isSelected
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
