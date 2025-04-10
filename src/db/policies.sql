-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON employees;

DROP POLICY IF EXISTS "Enable read access for all users" ON areas;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON areas;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON areas;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON areas;

-- Update gender check constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_gender_check;
ALTER TABLE employees ADD CONSTRAINT employees_gender_check 
  CHECK (gender IS NULL OR LOWER(gender) IN ('male', 'female', 'other'));

-- Enable RLS on tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Enable read access for all users" 
ON employees FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON employees FOR INSERT 
WITH CHECK (auth.role() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" 
ON employees FOR UPDATE 
USING (auth.role() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" 
ON employees FOR DELETE 
USING (auth.role() IS NOT NULL);

-- Create policies for areas table
CREATE POLICY "Enable read access for all users" 
ON areas FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON areas FOR INSERT 
WITH CHECK (auth.role() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" 
ON areas FOR UPDATE 
USING (auth.role() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" 
ON areas FOR DELETE 
USING (auth.role() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON employees TO authenticated;
GRANT ALL ON areas TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 