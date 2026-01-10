import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/shared/store';
import { fabVariants } from '@/styles/animations';
import { cn } from '@/shared/utils/cn';

interface FABProps {
  className?: string;
}

export function FAB({ className }: FABProps) {
  const { openAddTaskModal } = useUIStore();

  return (
    <motion.button
      variants={fabVariants}
      initial="initial"
      animate="animate"
      whileTap="tap"
      whileHover="hover"
      onClick={openAddTaskModal}
      className={cn(
        'fixed bottom-20 right-4 z-[60]',
        'w-14 h-14 rounded-full',
        'bg-accent-primary text-white',
        'flex items-center justify-center',
        'shadow-lg shadow-accent-primary/25',
        'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background',
        'md:bottom-8 md:right-8',
        className
      )}
      data-testid="fab-button"
      aria-label="Add new task"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}
