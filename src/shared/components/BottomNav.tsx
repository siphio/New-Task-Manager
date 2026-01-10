import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useUIStore } from '@/shared/store';

const navItems = [
  { path: '/', icon: Home, label: 'Home', id: 'home' as const },
  { path: '/calendar', icon: Calendar, label: 'Calendar', id: 'calendar' as const },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', id: 'analytics' as const },
  { path: '/profile', icon: User, label: 'Profile', id: 'profile' as const },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveNavItem, isMobileNavVisible } = useUIStore();

  if (!isMobileNavVisible) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background-secondary border-t border-background-tertiary safe-area-pb"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setActiveNavItem(item.id);
              }}
              className={cn(
                'relative flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors',
                'hover:bg-background-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background',
                isActive ? 'text-accent-primary' : 'text-text-secondary'
              )}
              data-testid={`nav-${item.id}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
