import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ZKLib } from 'https://esm.sh/node-zklib@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS')?.split(',') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { ipAddress, port = 4370, timeout = 5000, deviceId } = await req.json()

    if (!ipAddress || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize ZK device
    const zkInstance = new ZKLib({
      ip: ipAddress,
      port: port,
      timeout: timeout
    })

    // Connect to device
    await zkInstance.createSocket()
    console.log('Connected to device')

    // Get device info
    const deviceInfo = await zkInstance.getInfo()
    console.log('Device info:', deviceInfo)

    // Get attendance logs
    const attendanceLogs = await zkInstance.getAttendance()
    console.log(`Found ${attendanceLogs.length} attendance records`)

    // Store attendance in Supabase
    const { error } = await supabaseClient
      .from('attendance_records')
      .upsert(
        attendanceLogs.map((record: any) => ({
          user_id: record.uid.toString(),
          timestamp: record.timestamp,
          type: record.type,
          device_id: deviceId
        }))
      )

    if (error) throw error

    // Disconnect from device
    await zkInstance.disconnect()
    console.log('Disconnected from device')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Attendance data synced successfully',
        records: attendanceLogs.length,
        deviceInfo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

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