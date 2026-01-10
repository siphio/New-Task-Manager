import { PageContainer } from '@/shared/components/PageContainer';
import { useAuth } from '@/app/providers';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <PageContainer>
      <div className="pt-6" data-testid="home-screen">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}
        </h1>

        {/* Daily Goals Progress - Placeholder */}
        <div className="mt-6 p-6 bg-background-secondary rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-background-tertiary"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset="20"
                  strokeLinecap="round"
                  className="text-accent-primary"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
                80%
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Daily Goals</h2>
              <p className="text-sm text-text-secondary">8/10 tasks</p>
            </div>
          </div>
        </div>

        {/* Task List Placeholder */}
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Today's Tasks</h2>
          {[
            { title: 'Quarterly Review Prep', category: 'work' },
            { title: 'Grocery Shopping', category: 'personal' },
            { title: 'Design Sprint Sync', category: 'team' },
            { title: 'Read 30 pages', category: 'self' },
          ].map((task, i) => (
            <div
              key={i}
              className="p-4 bg-background-secondary rounded-xl flex items-center gap-3"
              data-testid={`task-card-${i}`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    task.category === 'work' ? '#0A84FF' :
                    task.category === 'personal' ? '#2DA44E' :
                    task.category === 'team' ? '#DB61A2' :
                    '#D29922'
                }}
              />
              <span className="text-text-primary">{task.title}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
