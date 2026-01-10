import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/shared/components/ui/drawer';
import { TaskForm } from './TaskForm';
import { useUIStore, useTaskStore } from '@/shared/store';

export function TaskDrawer() {
  const { isTaskDrawerOpen, editingTaskId, closeTaskDrawer } = useUIStore();
  const { getTaskById } = useTaskStore();

  const task = editingTaskId ? getTaskById(editingTaskId) : undefined;
  const isEditing = !!task;

  return (
    <Drawer open={isTaskDrawerOpen} onOpenChange={(open) => !open && closeTaskDrawer()}>
      <DrawerContent className="bg-background-secondary border-background-tertiary max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-background-tertiary pb-4">
          <DrawerTitle className="text-text-primary">
            {isEditing ? 'Edit Task' : 'New Task'}
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <TaskForm task={task} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
