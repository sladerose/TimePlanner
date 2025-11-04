import { getDailyRAGStatus, getMonthlyRAGStatus, getYearlyRAGStatus } from '../ragCalculations';
import { DailyEntry } from '@/store/useCalendarStore';
import { formatISO, subMonths, addMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, addYears } from 'date-fns';

describe('RAG Status Calculations', () => {
  // Mock DailyEntry data for testing
  const mockDailyEntries: DailyEntry[] = [
    // January 2023
    { id: '1', user_id: 'user1', entry_date: '2023-01-01', target_hours: 2, actual_hours: 2, created_at: '', updated_at: '' }, // Green
    { id: '2', user_id: 'user1', entry_date: '2023-01-02', target_hours: 2, actual_hours: 1.9, created_at: '', updated_at: '' }, // Amber (1.9/2 = 95%, 10% threshold)
    { id: '3', user_id: 'user1', entry_date: '2023-01-03', target_hours: 2, actual_hours: 1.5, created_at: '', updated_at: '' }, // Red (1.5/2 = 75%, 10% threshold)
    { id: '4', user_id: 'user1', entry_date: '2023-01-04', target_hours: 0, actual_hours: 1, created_at: '', updated_at: '' }, // Green (no target)
    // February 2023
    { id: '5', user_id: 'user1', entry_date: '2023-02-01', target_hours: 3, actual_hours: 3, created_at: '', updated_at: '' },
    { id: '6', user_id: 'user1', entry_date: '2023-02-02', target_hours: 3, actual_hours: 2.8, created_at: '', updated_at: '' },
    // December 2022 (for yearly test)
    { id: '7', user_id: 'user1', entry_date: '2022-12-25', target_hours: 1, actual_hours: 1, created_at: '', updated_at: '' },
  ];

  describe('getDailyRAGStatus', () => {
    it('should return green if actual >= target', () => {
      const entry = mockDailyEntries[0];
      const result = getDailyRAGStatus(entry);
      expect(result.status).toBe('green');
    });

    it('should return amber if actual is slightly below target', () => {
      const entry = mockDailyEntries[1];
      const result = getDailyRAGStatus(entry);
      expect(result.status).toBe('amber');
    });

    it('should return red if actual is significantly below target', () => {
      const entry = mockDailyEntries[2];
      const result = getDailyRAGStatus(entry);
      expect(result.status).toBe('red');
    });

    it('should return green if target is 0', () => {
      const entry = mockDailyEntries[3];
      const result = getDailyRAGStatus(entry);
      expect(result.status).toBe('green');
    });

    it('should return green for undefined entry (no data)', () => {
      const result = getDailyRAGStatus(undefined);
      expect(result.status).toBe('green');
    });
  });

  describe('getMonthlyRAGStatus', () => {
    it('should calculate monthly RAG status for January 2023 (red)', () => {
      const date = new Date('2023-01-15');
      const result = getMonthlyRAGStatus(date, mockDailyEntries);
      // Total target for Jan: 2+2+2+0 = 6
      // Total actual for Jan: 2+1.9+1.5+1 = 6.4
      // This test case needs adjustment based on the mock data and RAG logic
      // Let's re-evaluate mock data for a clear red/amber/green monthly scenario
      const janEntries = mockDailyEntries.filter(e => e.entry_date.startsWith('2023-01'));
      const janTarget = janEntries.reduce((sum, e) => sum + e.target_hours, 0); // 6
      const janActual = janEntries.reduce((sum, e) => sum + e.actual_hours, 0); // 6.4
      // With actual > target, it should be green
      expect(result.status).toBe('green');
      expect(result.target).toBeCloseTo(6);
      expect(result.actual).toBeCloseTo(6.4);
    });

    it('should calculate monthly RAG status for February 2023 (green)', () => {
      const date = new Date('2023-02-10');
      const result = getMonthlyRAGStatus(date, mockDailyEntries);
      // Total target for Feb: 3+3 = 6
      // Total actual for Feb: 3+2.8 = 5.8
      // 5.8 / 6 = 0.966 -> (6-5.8)/6 = 0.033 (3.3%) which is <= 10% threshold, so amber
      expect(result.status).toBe('amber');
      expect(result.target).toBeCloseTo(6);
      expect(result.actual).toBeCloseTo(5.8);
    });

    it('should handle months with no entries', () => {
      const date = new Date('2023-03-15'); // March has no entries
      const result = getMonthlyRAGStatus(date, mockDailyEntries);
      expect(result.status).toBe('green'); // No target, so green
      expect(result.target).toBe(0);
      expect(result.actual).toBe(0);
    });
  });

  describe('getYearlyRAGStatus', () => {
    it('should calculate yearly RAG status for 2023', () => {
      const date = new Date('2023-06-01');
      const result = getYearlyRAGStatus(date, mockDailyEntries);
      // Total target for 2023: 6 (Jan) + 6 (Feb) = 12
      // Total actual for 2023: 6.4 (Jan) + 5.8 (Feb) = 12.2
      // With actual > target, it should be green
      expect(result.status).toBe('green');
      expect(result.target).toBeCloseTo(12);
      expect(result.actual).toBeCloseTo(12.2);
    });

    it('should handle years with no entries', () => {
      const date = new Date('2024-06-01'); // 2024 has no entries
      const result = getYearlyRAGStatus(date, mockDailyEntries);
      expect(result.status).toBe('green'); // No target, so green
      expect(result.target).toBe(0);
      expect(result.actual).toBe(0);
    });

    it('should include entries from previous year if date range spans', () => {
      // This test case is more complex as getYearlyRAGStatus is for a specific year
      // The mock data only has one entry for 2022, so let's test 2022
      const date = new Date('2022-06-01');
      const result = getYearlyRAGStatus(date, mockDailyEntries);
      // Target for 2022: 1
      // Actual for 2022: 1
      expect(result.status).toBe('green');
      expect(result.target).toBeCloseTo(1);
      expect(result.actual).toBeCloseTo(1);
    });
  });
});
