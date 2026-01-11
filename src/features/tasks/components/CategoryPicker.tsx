import { Category } from '@/shared/types';
import { categoryColors, categoryLabels } from '@/shared/utils';
import { cn } from '@/shared/utils';

interface CategoryPickerProps {
  value: Category;
  onChange: (category: Category) => void;
}

const categories: Category[] = ['work', 'personal', 'self-improvement'];

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="flex gap-2">
      {categories.map((category) => {
        const isSelected = value === category;
        const color = categoryColors[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              'border min-h-[40px]',
              isSelected
                ? 'text-white border-transparent'
                : 'text-muted-foreground border-[#3a3f4b] hover:border-muted-foreground'
            )}
            style={{
              backgroundColor: isSelected ? color : 'transparent',
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
