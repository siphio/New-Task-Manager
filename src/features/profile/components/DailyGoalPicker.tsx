import { useState } from 'react';
import { Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/shared/components/ui/slider';
import { Button } from '@/shared/components/ui/button';
import { useSettingsStore } from '@/shared/store';
import { cn } from '@/shared/utils';

interface DailyGoalPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyGoalPicker({ isOpen, onClose }: DailyGoalPickerProps) {
  const { dailyGoal, setDailyGoal } = useSettingsStore();
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  const handleSave = () => {
    setDailyGoal(tempGoal);
    onClose();
  };

  const goalOptions = [5, 10, 15, 20, 25];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-x-4 bottom-24 z-50 bg-background-secondary rounded-2xl p-6 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Daily Goal</h3>
                <p className="text-sm text-text-secondary">Tasks to complete each day</p>
              </div>
            </div>

            {/* Goal Display */}
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-accent-primary">{tempGoal}</span>
              <span className="text-xl text-text-secondary ml-2">tasks</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex justify-center gap-2 mb-6">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setTempGoal(goal)}
                  className={cn(
                    'w-12 h-12 rounded-full font-medium transition-colors',
                    tempGoal === goal
                      ? 'bg-accent-primary text-white'
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                  )}
                  data-testid={`goal-option-${goal}`}
                >
                  {goal}
                </button>
              ))}
            </div>

            {/* Slider */}
            <Slider
              value={[tempGoal]}
              onValueChange={(v) => setTempGoal(v[0])}
              min={1}
              max={30}
              step={1}
              className="mb-6"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent-primary hover:bg-accent-primary/90"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
