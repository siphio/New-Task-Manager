import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

interface SignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutDialog({ isOpen, onClose, onConfirm }: SignOutDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background-secondary border-background-tertiary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-text-primary">Sign out?</AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            You'll need to sign in again to access your tasks. Your data will be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-background-tertiary text-text-primary hover:bg-background-tertiary/80"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-accent-error text-white hover:bg-accent-error/90"
            data-testid="confirm-sign-out"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
