-- Create the daily_entries table
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  entry_date DATE NOT NULL,
  target_hours NUMERIC(4, 2) DEFAULT 0.00,
  actual_hours NUMERIC(4, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one entry per user per day
  UNIQUE (user_id, entry_date)
);

-- Optional: Indexes for performance
CREATE INDEX idx_daily_entries_user_id ON daily_entries (user_id);
CREATE INDEX idx_daily_entries_entry_date ON daily_entries (entry_date);
