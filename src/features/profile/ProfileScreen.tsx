import { useState } from 'react';
import { PageContainer } from '@/shared/components/PageContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/app/providers';
import { useSettingsStore, useTaskStore } from '@/shared/store';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { Bell, Target, FolderOpen, RefreshCw, LogOut, ListTodo, Flame, PieChart } from 'lucide-react';
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
            <AvatarFallback className="bg-primary text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
          <button className="text-sm text-primary mt-1">Edit Profile</button>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 py-4 px-3 bg-[#222830] rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ListTodo className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{totalTasks}</span>
            </div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </div>
          <div className="flex-1 py-4 px-3 bg-[#222830] rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{bestStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div className="flex-1 py-4 px-3 bg-[#222830] rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <PieChart className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{analytics.completionRate}%</span>
            </div>
            <div className="text-xs text-muted-foreground">Rate</div>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-[#222830] rounded-2xl overflow-hidden divide-y divide-[#3a3f4b]">
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
        <button className="w-full mt-6 p-4 bg-primary rounded-2xl flex items-center justify-center gap-2 text-white font-medium shadow-[0_0_30px_rgba(124,92,255,0.4)] hover:shadow-[0_0_40px_rgba(124,92,255,0.5)] transition-shadow">
          Upgrade to Pro
        </button>

        {/* Sign Out */}
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="w-full mt-4 p-4 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors"
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
