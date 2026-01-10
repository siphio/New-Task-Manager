import { motion } from 'framer-motion';
import { useTaskStore } from '@/shared/store';

interface DailyGoalsProps {
  dailyGoal?: number;
}

export function DailyGoals({ dailyGoal = 10 }: DailyGoalsProps) {
  const { getCompletedTodayCount } = useTaskStore();
  const completedCount = getCompletedTodayCount();

  const progress = Math.min(completedCount / dailyGoal, 1);
  const percentage = Math.round(progress * 100);

  // SVG circle calculations
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="p-6 bg-background-secondary rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-background-tertiary"
            />
            {/* Progress circle */}
            <motion.circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-accent-primary"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
            {percentage}%
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Daily Goals</h2>
          <p className="text-sm text-text-secondary">
            {completedCount}/{dailyGoal} tasks
          </p>
        </div>
      </div>
    </div>
  );
}
