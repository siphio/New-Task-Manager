import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/styles/animations';
import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function PageContainer({ children, className, title }: PageContainerProps) {
  return (
    <motion.main
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className={cn(
        'min-h-screen pb-20 px-4 pt-safe',
        'max-w-lg mx-auto',
        'md:max-w-2xl md:pb-8',
        'lg:max-w-4xl',
        className
      )}
    >
      {title && (
        <h1 className="text-2xl font-bold text-text-primary mb-6 pt-4">
          {title}
        </h1>
      )}
      {children}
    </motion.main>
  );
}
