import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { startOfMonth } from 'date-fns';
import { calculateRemainingPlannedHours } from '@/utils/ragCalculations';

interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string; // ISO date string, e.g., 'YYYY-MM-DD'
  target_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

interface MonthlyTarget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-DD, representing the first day of the month
  target_hours: number;
  created_at: string;
  updated_at: string;
}

interface CalendarState {
  dailyEntries: DailyEntry[];
  selectedDate: Date | null;
  monthlyTarget: MonthlyTarget | null;
  plannedHoursForRestOfMonth: number;
}

interface CalendarActions {
  setDailyEntries: (entries: DailyEntry[]) => void;
  addDailyEntry: (entry: DailyEntry) => void;
  updateDailyEntry: (entry: DailyEntry) => void;
  setSelectedDate: (date: Date | null) => void;
  setMonthlyTarget: (target: MonthlyTarget | null) => void;
  fetchInitialData: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState & CalendarActions>((set, get) => ({
  dailyEntries: [],
  selectedDate: null,
  monthlyTarget: null,
  plannedHoursForRestOfMonth: 0, // Initialize
  setDailyEntries: (entries) => set({ dailyEntries: entries }),
  addDailyEntry: (entry) =>
    set((state) => ({
      dailyEntries: [...state.dailyEntries, entry],
    })),
  updateDailyEntry: (updatedEntry) =>
    set((state) => ({
      dailyEntries: state.dailyEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      ),
    })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setMonthlyTarget: (target) => set({ monthlyTarget: target }),
  fetchInitialData: async () => {
    const userId = '2794e1e5-f071-484c-a886-bf397c23d540'; // Hardcoded for now
    const currentMonthStart = startOfMonth(new Date()).toISOString().split('T')[0];

    // Fetch daily entries
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId);

    if (dailyError) {
      console.error('Error fetching daily entries:', dailyError);
    } else {
      const entries = dailyData as DailyEntry[];
      set({ dailyEntries: entries });
      const remainingPlanned = calculateRemainingPlannedHours(new Date(), entries);
      set({ plannedHoursForRestOfMonth: remainingPlanned });
    }

    // Fetch monthly target
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonthStart)
      .single();

    if (monthlyError && monthlyError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching monthly target:', monthlyError);
    } else if (monthlyData) {
      set({ monthlyTarget: monthlyData as MonthlyTarget });
    } else {
      set({ monthlyTarget: null });
    }
  },
}));
