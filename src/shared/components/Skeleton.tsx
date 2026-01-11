import { cn } from '@/shared/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#2a2f38]', className)}
      data-testid="skeleton"
    />
  );
}
