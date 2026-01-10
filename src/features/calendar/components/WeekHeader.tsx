import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendarStore } from '@/shared/store';
import { Button } from '@/shared/components/ui/button';

export function WeekHeader() {
  const { weekStart, goToNextWeek, goToPrevWeek, goToToday } = useCalendarStore();

  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevWeek}
        data-testid="prev-week-button"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <button
        onClick={goToToday}
        className="text-xl font-bold text-text-primary hover:text-accent-primary transition-colors"
        data-testid="week-header-title"
      >
        {format(weekStart, 'MMMM yyyy')}
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextWeek}
        data-testid="next-week-button"
        aria-label="Next week"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
