import { useEffect } from 'react';
import { PageContainer } from '@/shared/components/PageContainer';
import { useAuth } from '@/app/providers';
import { useSettingsStore } from '@/shared/store';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { DailyGoals } from './components/DailyGoals';
import { TaskList } from './components/TaskList';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { user } = useAuth();
  const { dailyGoal, updateBestStreak } = useSettingsStore();
  const analytics = useAnalytics('week');
  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0] || user?.user_metadata?.name || 'User';

  // Update best streak when current streak changes
  useEffect(() => {
    updateBestStreak(analytics.currentStreak);
  }, [analytics.currentStreak, updateBestStreak]);

  return (
    <PageContainer>
      <div className="pt-6 space-y-6" data-testid="home-screen">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}
        </h1>

        <DailyGoals dailyGoal={dailyGoal} />

        <TaskList />
      </div>
    </PageContainer>
  );
}
