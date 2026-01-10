import { useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/shared/components/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TimeFilter } from '@/shared/types';
import { useAnalytics } from './hooks/useAnalytics';
import { ActivityChart } from './components/ActivityChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';

export function AnalyticsScreen() {
  const [filter, setFilter] = useState<TimeFilter>('week');
  const analytics = useAnalytics(filter);

  return (
    <PageContainer>
      <div className="pt-6 space-y-6" data-testid="analytics-screen">
        <h1 className="text-2xl font-bold text-text-primary">Your Progress</h1>

        {/* Time Filter Tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as TimeFilter)}
        >
          <TabsList className="grid w-full grid-cols-3 bg-background-secondary">
            <TabsTrigger value="week" data-testid="filter-week">Week</TabsTrigger>
            <TabsTrigger value="month" data-testid="filter-month">Month</TabsTrigger>
            <TabsTrigger value="year" data-testid="filter-year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Stats Card */}
        <div className="bg-background-secondary rounded-2xl p-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-accent-primary">
              {analytics.tasksCompleted}
            </span>
            <p className="text-text-secondary mt-2">Tasks Completed</p>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2 text-center">
              <Flame className="w-5 h-5 text-accent-warning" />
              <span className="text-lg font-semibold text-text-primary">
                {analytics.currentStreak} day streak
              </span>
            </div>
            <div className="flex items-center gap-2 text-center">
              <TrendingUp className="w-5 h-5 text-accent-success" />
              <span className="text-lg font-semibold text-text-primary">
                {analytics.completionRate}%
              </span>
              <span className="text-text-secondary">rate</span>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <ActivityChart data={analytics.weeklyActivity} />

        {/* Category Breakdown */}
        <CategoryBreakdown data={analytics.categoryBreakdown} />
      </div>
    </PageContainer>
  );
}
