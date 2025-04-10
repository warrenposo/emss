-- Drop existing RLS policies for employees table
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON employees;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON employees;

-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow all authenticated users to perform CRUD operations
CREATE POLICY "Enable read access for all users" 
ON employees FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON employees FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" 
ON employees FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" 
ON employees FOR DELETE 
USING (auth.role() = 'authenticated');

-- Grant necessary permissions to authenticated users
GRANT ALL ON employees TO authenticated;
GRANT USAGE ON SEQUENCE employees_id_seq TO authenticated; 