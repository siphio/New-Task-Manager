import { Category } from '@/shared/types';
import { categoryColors, categoryLabels } from '@/shared/utils';
import { cn } from '@/shared/utils';

interface CategoryPickerProps {
  value: Category;
  onChange: (category: Category) => void;
}

const categories: Category[] = ['work', 'personal', 'team', 'self-improvement'];

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = value === category;
        const color = categoryColors[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border-2 min-h-[36px]',
              isSelected
                ? 'text-white'
                : 'text-text-secondary border-background-tertiary hover:border-text-muted'
            )}
            style={{
              backgroundColor: isSelected ? color : 'transparent',
              borderColor: isSelected ? color : undefined,
            }}
            data-testid={`category-${category}`}
          >
            {categoryLabels[category]}
          </button>
        );
      })}
    </div>
  );
}
