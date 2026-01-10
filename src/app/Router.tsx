import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { Layout } from './Layout';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { AnalyticsScreen } from '@/features/analytics/AnalyticsScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { TaskDetailsScreen } from '@/features/tasks/TaskDetailsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeScreen />} />
        <Route path="/tasks/:id" element={<TaskDetailsScreen />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
