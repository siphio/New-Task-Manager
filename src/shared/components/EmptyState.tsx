import { Button } from '@/shared/components/ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-8 bg-[#222830] rounded-2xl text-center" data-testid="empty-state">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2f38] flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-foreground font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-primary text-white shadow-[0_0_20px_rgba(124,92,255,0.3)]"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
