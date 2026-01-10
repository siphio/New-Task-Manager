export interface TimeSlot {
  hour: number;
  minute: number;  // 0 or 30
  label: string;   // "9:00 AM"
}

export interface DayColumn {
  date: Date;
  dayName: string;    // "Mon"
  dayNumber: number;  // 20
  isToday: boolean;
  isSelected: boolean;
  taskCount: number;
}

export interface ScheduledBlock {
  taskId: string;
  top: number;      // pixels from grid top
  height: number;   // pixels
  left: number;     // percentage (0, 50 for overlap)
  width: number;    // percentage (100, 50 for overlap)
}

export const CALENDAR_CONFIG = {
  START_HOUR: 8,
  END_HOUR: 22,
  HOUR_HEIGHT: 60,
  SLOT_HEIGHT: 30,
  SLOT_MINUTES: 30,
} as const;
