import { LucideIcon, ChevronRight } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/utils';

interface SettingItemProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  testId?: string;
  isFirst?: boolean;
}

export function SettingItem({
  icon: Icon,
  label,
  value,
  hasToggle,
  toggleValue,
  onToggle,
  onClick,
  testId,
  isFirst = false,
}: SettingItemProps) {
  const handleClick = () => {
    if (hasToggle && onToggle) {
      onToggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center justify-between p-4',
        'hover:bg-background-tertiary transition-colors',
        !isFirst && 'border-t border-background-tertiary'
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-text-secondary" />
        <span className="text-text-primary">{label}</span>
      </div>

      {hasToggle ? (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      ) : value ? (
        <span className="text-text-secondary">{value}</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-text-muted" />
      )}
    </button>
  );
}
