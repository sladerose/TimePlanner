import { DailyEntry } from '@/store/useCalendarStore';
import { isSameDay, parseISO, startOfMonth, startOfYear, endOfMonth, endOfYear, eachDayOfInterval } from 'date-fns';

interface RAGStatusResult {
  status: 'red' | 'amber' | 'green';
  target: number;
  actual: number;
}

// Amber threshold: within this percentage of the target, it's amber.
// For example, if target is 10h, and actual is 9.5h and threshold is 0.1 (10%), it would be amber.
const AMBER_THRESHOLD_PERCENTAGE = 0.10; // 10%

const calculateRAGStatus = (target: number, actual: number): RAGStatusResult => {
  if (target === 0) {
    return { status: 'green', target, actual }; // If no target, always green (or we can define as grey/N/A)
  }

  if (actual >= target) {
    return { status: 'green', target, actual };
  }

  const difference = target - actual;
  const percentageDifference = difference / target;

  if (percentageDifference <= AMBER_THRESHOLD_PERCENTAGE) {
    return { status: 'amber', target, actual };
  }

  return { status: 'red', target, actual };
};

export const getDailyRAGStatus = (entry: DailyEntry | undefined): RAGStatusResult => {
  const target = entry ? entry.target_hours : 0;
  const actual = entry ? entry.actual_hours : 0;
  return calculateRAGStatus(target, actual);
};

export const getMonthlyRAGStatus = (date: Date, allDailyEntries: DailyEntry[]): RAGStatusResult => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start, end });

  let totalTarget = 0;
  let totalActual = 0;

  daysInMonth.forEach(day => {
    const entryForDay = allDailyEntries.find(entry =>
      isSameDay(parseISO(entry.entry_date), day)
    );
    totalTarget += entryForDay ? entryForDay.target_hours : 0;
    totalActual += entryForDay ? entryForDay.actual_hours : 0;
  });

  return calculateRAGStatus(totalTarget, totalActual);
};

export const getYearlyRAGStatus = (date: Date, allDailyEntries: DailyEntry[]): RAGStatusResult => {
  const start = startOfYear(date);
  const end = endOfYear(date);
  const daysInYear = eachDayOfInterval({ start, end });

  let totalTarget = 0;
  let totalActual = 0;

  daysInYear.forEach(day => {
    const entryForDay = allDailyEntries.find(entry =>
      isSameDay(parseISO(entry.entry_date), day)
    );
    totalTarget += entryForDay ? entryForDay.target_hours : 0;
    totalActual += entryForDay ? entryForDay.actual_hours : 0;
  });

  return calculateRAGStatus(totalTarget, totalActual);
};

export const calculateMonthlyPlannedHours = (date: Date, allDailyEntries: DailyEntry[]): number => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start, end });

  let totalPlanned = 0;
  daysInMonth.forEach(day => {
    const entryForDay = allDailyEntries.find(entry =>
      isSameDay(parseISO(entry.entry_date), day)
    );
    totalPlanned += entryForDay ? entryForDay.target_hours : 0;
  });
  return totalPlanned;
};

export const calculateMonthlyActualHours = (date: Date, allDailyEntries: DailyEntry[]): number => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start, end });

  let totalActual = 0;
  daysInMonth.forEach(day => {
    const entryForDay = allDailyEntries.find(entry =>
      isSameDay(parseISO(entry.entry_date), day)
    );
    totalActual += entryForDay ? entryForDay.actual_hours : 0;
  });
  return totalActual;
};

export const calculateRemainingPlannedHours = (date: Date, allDailyEntries: DailyEntry[]): number => {
  const today = new Date();
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start, end });

  let remainingPlanned = 0;
  daysInMonth.forEach(day => {
    // Only consider planned hours for today and future days
    if (day > today) {
      const entryForDay = allDailyEntries.find(entry =>
        isSameDay(parseISO(entry.entry_date), day)
      );
      remainingPlanned += entryForDay ? entryForDay.target_hours : 0;
    }
  });
  return remainingPlanned;
};

export const getMonthlyProgressStatus = (
  monthlyTargetHours: number,
  monthlyPlannedHours: number,
  monthlyActualHours: number,
  allDailyEntries: DailyEntry[]
): 'On Track' | 'Lagging (Re-plan needed)' | 'Ahead' => {
  if (monthlyTargetHours === 0) {
    return 'On Track'; // No target, so always on track
  }

  const today = new Date();
  const requiredToMeetTarget = monthlyTargetHours - monthlyActualHours;
  const remainingPlannedHours = calculateRemainingPlannedHours(today, allDailyEntries);

  if (monthlyActualHours >= monthlyTargetHours) {
    return 'Ahead';
  }

  if (remainingPlannedHours < requiredToMeetTarget) {
    return 'Lagging (Re-plan needed)';
  }

  return 'On Track';
};
