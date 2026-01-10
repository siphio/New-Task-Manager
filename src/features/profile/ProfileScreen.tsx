import { PageContainer } from '@/shared/components/PageContainer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuth } from '@/app/providers';
import { Bell, Target, FolderOpen, RefreshCw, LogOut, ChevronRight } from 'lucide-react';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
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
          {[
            { label: 'Total Tasks', value: '156' },
            { label: 'Best Streak', value: '12' },
            { label: 'Rate', value: '89%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
              <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings List */}
        <div className="bg-background-secondary rounded-xl overflow-hidden">
          {[
            { icon: Bell, label: 'Notifications', hasToggle: true, testId: 'notifications-toggle' },
            { icon: Target, label: 'Daily Goal', value: '10 tasks', testId: 'setting-daily-goal' },
            { icon: FolderOpen, label: 'Categories', testId: 'setting-categories' },
            { icon: RefreshCw, label: 'Sync & Backup', testId: 'setting-sync' },
          ].map((item, i) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between p-4 hover:bg-background-tertiary transition-colors ${
                i !== 0 ? 'border-t border-background-tertiary' : ''
              }`}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-text-secondary" />
                <span className="text-text-primary">{item.label}</span>
              </div>
              {item.hasToggle ? (
                <div className="w-10 h-6 bg-accent-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              ) : item.value ? (
                <span className="text-text-secondary">{item.value}</span>
              ) : (
                <ChevronRight className="w-5 h-5 text-text-muted" />
              )}
            </button>
          ))}
        </div>

        {/* Upgrade Banner */}
        <button className="w-full mt-6 p-4 bg-accent-warning/20 rounded-xl flex items-center justify-center gap-2 text-accent-warning font-medium">
          Upgrade to Pro ⭐
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full mt-4 p-4 text-accent-error flex items-center justify-center gap-2"
          data-testid="sign-out-button"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </PageContainer>
  );
}
