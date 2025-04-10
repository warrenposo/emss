import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employee_id, device_id, timestamp, state } = req.body;

    if (!employee_id || !device_id || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employee_id)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (state === 'in') {
      // Create new attendance record for entry
      const { data, error } = await supabase
        .from('attendance')
        .insert([
          {
            employee_id,
            device_id,
            entry_time: new Date(timestamp).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json(data);
    } else if (state === 'out') {
      // Update existing attendance record with exit time
      const { data: latestEntry, error: entryError } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee_id)
        .is('exit_time', null)
        .order('entry_time', { ascending: false })
        .limit(1)
        .single();

      if (entryError) {
        throw entryError;
      }

      if (!latestEntry) {
        return res.status(404).json({ error: 'No active attendance record found' });
      }

      const { data, error } = await supabase
        .from('attendance')
        .update({
          exit_time: new Date(timestamp).toISOString(),
        })
        .eq('id', latestEntry.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: 'Invalid state value' });
    }
  } catch (error: any) {
    console.error('Error processing attendance:', error);
    return res.status(500).json({ error: error.message });
  }
} 