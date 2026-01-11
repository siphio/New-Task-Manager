import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/shared/components/BottomNav';
import { FAB } from '@/shared/components/FAB';
import { TaskDrawer } from '@/features/tasks';
import { useUIStore } from '@/shared/store';

export function Layout() {
  const location = useLocation();
  const { isTaskDrawerOpen } = useUIStore();
  const showFAB = location.pathname !== '/profile' && !isTaskDrawerOpen;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      {showFAB && <FAB />}
      <BottomNav />
      <TaskDrawer />
    </div>
  );
}
