import { CALENDAR_CONFIG } from '@/shared/types';
import { format, setHours, setMinutes, parseISO } from 'date-fns';

const { START_HOUR, END_HOUR, HOUR_HEIGHT, SLOT_HEIGHT, SLOT_MINUTES } = CALENDAR_CONFIG;

export function generateTimeSlots() {
  const slots = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    slots.push({
      hour,
      minute: 0,
      label: format(setHours(setMinutes(new Date(), 0), hour), 'h a'),
    });
    slots.push({
      hour,
      minute: 30,
      label: '',
    });
  }
  return slots;
}

export function getTopPosition(time: Date | string): number {
  const date = typeof time === 'string' ? parseISO(time) : time;
  const hours = date.getHours() - START_HOUR;
  const minutes = date.getMinutes();
  return Math.max(0, (hours * HOUR_HEIGHT) + (minutes / 60 * HOUR_HEIGHT));
}

export function getTaskHeight(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  return Math.max(durationHours * HOUR_HEIGHT, SLOT_HEIGHT);
}

export function positionToTime(y: number, baseDate: Date): { start: Date; end: Date } {
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  const snappedMinutes = Math.round(totalMinutes / SLOT_MINUTES) * SLOT_MINUTES;
  const hours = Math.floor(snappedMinutes / 60) + START_HOUR;
  const minutes = snappedMinutes % 60;

  const start = setMinutes(setHours(baseDate, hours), minutes);
  const end = setMinutes(setHours(baseDate, hours), minutes + 30);

  return { start, end };
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
}

export function getGridHeight(): number {
  return (END_HOUR - START_HOUR) * HOUR_HEIGHT;
}

export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const hours = now.getHours();
  if (hours < START_HOUR || hours >= END_HOUR) return null;
  return getTopPosition(now);
}
