import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskForm } from './TaskForm';
import { useUIStore, useTaskStore } from '@/shared/store';

export function TaskDrawer() {
  const { isTaskDrawerOpen, editingTaskId, closeTaskDrawer } = useUIStore();
  const { getTaskById } = useTaskStore();

  const task = editingTaskId ? getTaskById(editingTaskId) : undefined;
  const isEditing = !!task;

  return (
    <AnimatePresence>
      {isTaskDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={closeTaskDrawer}
          />

          {/* Full-screen sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 h-[92vh] bg-[#161B22] rounded-t-3xl flex flex-col overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[#484F58] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-[#2a2f38]">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={closeTaskDrawer}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a2f38] text-[#8B949E] hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable form content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
              <TaskForm task={task} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
