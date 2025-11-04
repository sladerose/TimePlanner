import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';
import { useCalendarStore } from '@/store/useCalendarStore';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [
          { id: '1', user_id: 'test-user', entry_date: '2023-01-01', target_hours: 2, actual_hours: 2, created_at: '', updated_at: '' },
          { id: '2', user_id: 'test-user', entry_date: '2023-01-02', target_hours: 3, actual_hours: 2.5, created_at: '', updated_at: '' },
        ],
        error: null,
      })),
    })),
  },
}));

// Mock Zustand store to control its state for testing
// We need to mock the actual hook function directly
jest.mock('@/store/useCalendarStore', () => ({
  useCalendarStore: jest.fn(),
}));

describe('Home Page Integration', () => {
  const mockDailyEntries = [
    { id: '1', user_id: 'test-user', entry_date: '2023-01-01', target_hours: 2, actual_hours: 2, created_at: '', updated_at: '' },
    { id: '2', user_id: 'test-user', entry_date: '2023-01-02', target_hours: 3, actual_hours: 2.5, created_at: '', updated_at: '' },
  ];
  const mockSetDailyEntries = jest.fn();

  beforeEach(() => {
    // Reset Zustand store mock before each test
    (useCalendarStore as jest.Mock).mockReturnValue({
      dailyEntries: [],
      setDailyEntries: mockSetDailyEntries,
    });
  });

  it('renders the calendar, summary, and chart components', async () => {
    // Mock the Zustand store to return some data after fetching
    (useCalendarStore as jest.Mock).mockReturnValue({
      dailyEntries: mockDailyEntries,
      setDailyEntries: mockSetDailyEntries,
    });

    render(<Home />);

    // Check for elements from MyCalendar (e.g., a day cell content)
    await waitFor(() => {
      expect(screen.getByText(/Target: 2h/i)).toBeInTheDocument();
      expect(screen.getByText(/Actual: 2h/i)).toBeInTheDocument();
    });

    // Check for elements from SummaryDisplay
    expect(screen.getByText(/Monthly Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Yearly Summary/i)).toBeInTheDocument();

    // Check for elements from MonthlyTrendChart
    expect(screen.getByText(/Monthly Target vs. Actual/i)).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    // Mock Zustand store to show loading state
    (useCalendarStore as jest.Mock).mockReturnValue({
      dailyEntries: [],
      setDailyEntries: mockSetDailyEntries,
    });

    // Mock Supabase to simulate a delay in fetching
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => new Promise(() => {})), // Never resolves
    });

    render(<Home />);
    expect(screen.getByText(/Loading calendar data.../i)).toBeInTheDocument();
  });

  it('displays error state if data fetching fails', async () => {
    const errorMessage = 'Failed to fetch!';
    // Mock Supabase to return an error
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        data: null,
        error: { message: errorMessage },
      })),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
