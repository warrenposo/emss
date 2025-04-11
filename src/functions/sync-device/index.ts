import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ZKLib } from 'https://esm.sh/node-zklib@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceSyncRequest {
  deviceId: string;
}

interface Device {
  id: string;
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
  device_id: string;
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

    const { deviceId } = await req.json() as DeviceSyncRequest

    if (!deviceId) {
      return new Response(
        JSON.stringify({ error: 'Device ID is required' }),
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

    // Initialize ZK device
    const zkInstance = new ZKLib({
      ip: device.ip_address,
      port: 4370,
      timeout: 5000
    })

    try {
      // Connect to device
      await zkInstance.createSocket()
      console.log('Connected to device:', device.alias)

      // Get device info
      const deviceInfo = await zkInstance.getInfo()
      console.log('Device info:', deviceInfo)

      // Get attendance logs
      const attendanceLogs = await zkInstance.getAttendance()
      console.log(`Found ${attendanceLogs.length} attendance records`)

      // Transform attendance logs to match our database schema
      const records: AttendanceRecord[] = attendanceLogs.map((log: any) => ({
        user_id: log.uid.toString(),
        device_id: deviceId,
        timestamp: new Date(log.timestamp).toISOString(),
        temperature: log.temperature || null,
        verify_type: getVerifyType(log.verifyType),
        status: getStatus(log.status),
        remark: log.remark || null
      }))

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
          message: 'Attendance data synced successfully',
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

    } finally {
      // Always disconnect from device
      await zkInstance.disconnect()
      console.log('Disconnected from device:', device.alias)
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