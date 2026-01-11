import { useState } from 'react';
import { Flame } from 'lucide-react';
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
      <div className="pt-6 space-y-5" data-testid="analytics-screen">
        <h1 className="text-2xl font-bold text-text-primary">Your Progress</h1>

        {/* Time Filter Tabs */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as TimeFilter)}
        >
          <TabsList className="w-full bg-transparent border-b border-[#3a3f4b] rounded-none p-0">
            <TabsTrigger
              value="week"
              data-testid="filter-week"
              className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground bg-transparent"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              data-testid="filter-month"
              className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground bg-transparent"
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="year"
              data-testid="filter-year"
              className="flex-1 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground bg-transparent"
            >
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Stats Card */}
        <div className="p-5 bg-[#222830] rounded-2xl text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {analytics.tasksCompleted}
          </div>
          <p className="text-muted-foreground">Tasks Completed</p>
          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-foreground">{analytics.currentStreak}</span>
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-foreground">{analytics.completionRate}%</span>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
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
