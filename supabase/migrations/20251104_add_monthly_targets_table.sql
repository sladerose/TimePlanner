-- Create the monthly_targets table
CREATE TABLE monthly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month DATE NOT NULL,
  target_hours NUMERIC(4, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one monthly target per user per month
  UNIQUE (user_id, month)
);

-- Optional: Indexes for performance
CREATE INDEX idx_monthly_targets_user_id ON monthly_targets (user_id);
CREATE INDEX idx_monthly_targets_month ON monthly_targets (month);
