-- Add is_split column to fixed_expenses table
ALTER TABLE fixed_expenses ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT FALSE;

-- Update RLS policies if necessary (usually not needed for a new column if using * in policies)
-- But just in case, this ensures the column is available for the user
COMMENT ON COLUMN fixed_expenses.is_split IS 'Whether to split the expense reserve: 50% in first quincena, 100% in second quincena';
