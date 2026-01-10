import { PageContainer } from '@/shared/components/PageContainer';

export function CalendarScreen() {
  const today = new Date();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <PageContainer>
      <div className="pt-6" data-testid="calendar-screen">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 text-text-secondary hover:text-text-primary" data-testid="prev-week-button">
            &lt;
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          <button className="p-2 text-text-secondary hover:text-text-primary" data-testid="next-week-button">
            &gt;
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + i + 1);
            const isToday = date.toDateString() === today.toDateString();

            return (
              <button
                key={day}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isToday
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-background-tertiary'
                }`}
                data-testid={`day-column-${day.toLowerCase()}`}
              >
                <span className="text-xs">{day}</span>
                <span className="text-lg font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Time Grid Placeholder */}
        <div className="bg-background-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Schedule</h2>
          <div className="space-y-2">
            {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM'].map((time) => (
              <div key={time} className="flex items-center gap-4 py-2 border-b border-background-tertiary">
                <span className="text-xs text-text-muted w-12">{time}</span>
                <div className="flex-1 h-12 rounded bg-background-tertiary/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
