import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ZKLib } from 'https://esm.sh/node-zklib@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceSyncRequest {
  deviceId: string; // This is a UUID string
  ip_address: string;
  port: number;
  timeout: number;
}

interface Device {
  id: string; // This is a UUID string
  serial_number: string;
  device_type: string;
  alias: string;
  status: string;
  ip_address: string;
  platform: string;
  firmware_version: string;
}

interface AttendanceRecord {
  user_id: string;
  device_id: string; // This is a UUID string
  timestamp: string;
  temperature: number | null;
  verify_type: string | null;
  status: string | null;
  remark: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { deviceId, ip_address, port, timeout } = await req.json() as DeviceSyncRequest

    if (!deviceId || !isValidUUID(deviceId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid device ID format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get device details from database
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single()

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      // Generate test attendance records
      const records: AttendanceRecord[] = [];
      const users = ['1001', '1002', '1003', '1004', '1005'];
      const now = new Date();
      
      // Generate records for each user
      for (const userId of users) {
        // Check-in (morning)
        const checkInTime = new Date(now);
        checkInTime.setHours(8 + Math.random() * 2); // Random time between 8-10 AM
        
        records.push({
          user_id: userId,
          device_id: deviceId,
          timestamp: checkInTime.toISOString(),
          temperature: 36 + Math.random(), // Random temperature between 36-37
          verify_type: 'fingerprint',
          status: 'Check-In',
          remark: 'Test data'
        });

        // Check-out (evening)
        const checkOutTime = new Date(now);
        checkOutTime.setHours(17 + Math.random() * 2); // Random time between 5-7 PM
        
        records.push({
          user_id: userId,
          device_id: deviceId,
          timestamp: checkOutTime.toISOString(),
          temperature: 36 + Math.random(),
          verify_type: 'fingerprint',
          status: 'Check-Out',
          remark: 'Test data'
        });
      }

      // Store attendance in Supabase
      const { error } = await supabaseClient
        .from('attendance_records')
        .upsert(records)

      if (error) throw error

      // Update device last_update timestamp
      await supabaseClient
        .from('devices')
        .update({ last_update: new Date().toISOString() })
        .eq('id', deviceId)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Test attendance data synced successfully',
          records: records.length,
          deviceInfo: {
            id: device.id,
            alias: device.alias,
            status: device.status,
            firmware: device.firmware_version,
            lastUpdate: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Error generating test data:', error)
      throw error
    }

  } catch (error) {
    console.error('Error in sync-device function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to sync with biometric device'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions to map device-specific values to our schema
function getVerifyType(verifyType: number): string {
  switch (verifyType) {
    case 0: return 'password';
    case 1: return 'fingerprint';
    case 2: return 'card';
    case 3: return 'face';
    default: return 'unknown';
  }
}

function getStatus(status: number): string {
  switch (status) {
    case 0: return 'Check-In';
    case 1: return 'Check-Out';
    case 2: return 'Break-Out';
    case 3: return 'Break-In';
    case 4: return 'Overtime-In';
    case 5: return 'Overtime-Out';
    default: return 'Unknown';
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 