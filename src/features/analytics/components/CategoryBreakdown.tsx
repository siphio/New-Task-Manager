import { motion } from 'framer-motion';
import { CategoryStats } from '@/shared/types';

interface CategoryBreakdownProps {
  data: CategoryStats[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="bg-[#222830] rounded-2xl p-4">
      <h2 className="text-lg font-semibold text-foreground mb-3">
        Category Breakdown
      </h2>
      <div className="space-y-3">
        {data.map((cat, index) => (
          <div key={cat.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-foreground text-sm">
              {cat.category}
            </span>
            <div className="w-24 h-2 bg-[#2a2f38] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-10 text-right">
              {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
