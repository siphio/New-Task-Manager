import { useState } from 'react';
import { PageContainer } from '@/shared/components/PageContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/app/providers';
import { useSettingsStore, useTaskStore } from '@/shared/store';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { Bell, Target, FolderOpen, RefreshCw, LogOut } from 'lucide-react';
import { SettingItem } from './components/SettingItem';
import { DailyGoalPicker } from './components/DailyGoalPicker';
import { SignOutDialog } from './components/SignOutDialog';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { dailyGoal, notificationsEnabled, bestStreak, toggleNotifications } =
    useSettingsStore();
  const { tasks } = useTaskStore();
  const analytics = useAnalytics('year');

  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const totalTasks = tasks.filter((t) => t.completed).length;

  const handleSignOut = async () => {
    setShowSignOutDialog(false);
    await signOut();
  };

  return (
    <PageContainer>
      <div className="pt-6" data-testid="profile-screen">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-accent-primary text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
          <button className="text-sm text-accent-primary mt-1">Edit Profile</button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <span className="text-2xl font-bold text-text-primary">{totalTasks}</span>
            <p className="text-xs text-text-secondary mt-1">Total Tasks</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-text-primary">{bestStreak}</span>
            <p className="text-xs text-text-secondary mt-1">Best Streak</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-text-primary">
              {analytics.completionRate}%
            </span>
            <p className="text-xs text-text-secondary mt-1">Rate</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-background-secondary rounded-xl overflow-hidden">
          <SettingItem
            icon={Bell}
            label="Notifications"
            hasToggle
            toggleValue={notificationsEnabled}
            onToggle={toggleNotifications}
            testId="notifications-toggle"
            isFirst
          />
          <SettingItem
            icon={Target}
            label="Daily Goal"
            value={`${dailyGoal} tasks`}
            onClick={() => setShowGoalPicker(true)}
            testId="setting-daily-goal"
          />
          <SettingItem
            icon={FolderOpen}
            label="Categories"
            testId="setting-categories"
          />
          <SettingItem
            icon={RefreshCw}
            label="Sync & Backup"
            testId="setting-sync"
          />
        </div>

        {/* Upgrade Banner */}
        <button className="w-full mt-6 p-4 bg-accent-warning/20 rounded-xl flex items-center justify-center gap-2 text-accent-warning font-medium">
          Upgrade to Pro
        </button>

        {/* Sign Out */}
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="w-full mt-4 p-4 text-accent-error flex items-center justify-center gap-2"
          data-testid="sign-out-button"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Modals */}
      <DailyGoalPicker
        isOpen={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
      />
      <SignOutDialog
        isOpen={showSignOutDialog}
        onClose={() => setShowSignOutDialog(false)}
        onConfirm={handleSignOut}
      />
    </PageContainer>
  );
}
