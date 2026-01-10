import { TimeSlot as TimeSlotType } from '@/shared/types';
import { cn } from '@/shared/utils';

interface TimeSlotProps {
  slot: TimeSlotType;
}

export function TimeSlot({ slot }: TimeSlotProps) {
  const isHourStart = slot.minute === 0;

  return (
    <div
      className={cn(
        'h-[30px] border-b border-background-tertiary/50 relative',
        isHourStart && 'border-b-background-tertiary'
      )}
      data-testid={`time-slot-${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`}
    >
      {isHourStart && (
        <span className="absolute -top-2 -left-14 w-12 text-right text-xs text-text-muted">
          {slot.label}
        </span>
      )}
    </div>
  );
}
