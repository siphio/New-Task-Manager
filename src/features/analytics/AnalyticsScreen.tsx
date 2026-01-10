import { PageContainer } from '@/shared/components/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function AnalyticsScreen() {
  return (
    <PageContainer>
      <div className="pt-6" data-testid="analytics-screen">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Your Progress</h1>

        {/* Time Filter Tabs */}
        <Tabs defaultValue="week" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-background-secondary">
            <TabsTrigger value="week" data-testid="filter-week">Week</TabsTrigger>
            <TabsTrigger value="month" data-testid="filter-month">Month</TabsTrigger>
            <TabsTrigger value="year" data-testid="filter-year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Cards */}
        <div className="bg-background-secondary rounded-2xl p-6 mb-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-accent-primary">47</span>
            <p className="text-text-secondary mt-2">Tasks Completed</p>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <span className="text-lg font-semibold text-text-primary">12 day streak</span>
              <span className="text-accent-warning ml-1">🔥</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-text-primary">85%</span>
              <span className="text-text-secondary ml-1">completion rate</span>
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="bg-background-secondary rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Activity</h2>
          <div className="flex items-end justify-between h-32 gap-2">
            {[40, 60, 45, 80, 65, 90, 70].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-accent-primary rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-muted">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-background-secondary rounded-xl p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Category Breakdown</h2>
          {[
            { name: 'Work', percent: 40, color: '#0A84FF' },
            { name: 'Personal', percent: 30, color: '#2DA44E' },
            { name: 'Team', percent: 20, color: '#DB61A2' },
            { name: 'Self-improvement', percent: 10, color: '#D29922' },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-text-primary">{cat.name}</span>
              <div className="w-24 h-2 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-sm text-text-secondary w-10 text-right">{cat.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
