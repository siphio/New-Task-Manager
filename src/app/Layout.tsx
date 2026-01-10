import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/shared/components/BottomNav';
import { FAB } from '@/shared/components/FAB';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <FAB />
      <BottomNav />
    </div>
  );
}
