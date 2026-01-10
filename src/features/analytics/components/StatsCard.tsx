import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';

interface StatsCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  suffix?: string;
  className?: string;
  accentColor?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  suffix,
  className,
  accentColor = 'text-accent-primary'
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-background-secondary rounded-xl p-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className={cn('w-6 h-6', accentColor)} />
        </div>
      )}
      <div className="flex items-baseline justify-center gap-1">
        <span className={cn('text-3xl font-bold', accentColor)}>
          {value}
        </span>
        {suffix && (
          <span className="text-text-secondary text-sm">{suffix}</span>
        )}
      </div>
      <p className="text-text-secondary text-sm mt-1">{label}</p>
    </motion.div>
  );
}
