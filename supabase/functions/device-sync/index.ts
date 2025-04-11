import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ZKLib } from '../lib/zklib.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ipAddress, port, deviceId } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Initialize ZKLib
    const zkInstance = new ZKLib({
      ip: ipAddress,
      port: port || 4370,
      timeout: 5000
    })

    // Connect to device
    await zkInstance.connect()

    // Get users from device
    const users = await zkInstance.getUsers()

    // Store users in Supabase
    const { error } = await supabaseClient
      .from('biometric_data')
      .upsert(
        users.map(user => ({
          device_id: deviceId,
          user_id: user.id,
          fingerprint_data: user.fingerprint_data
        }))
      )

    if (error) throw error

    // Disconnect from device
    await zkInstance.disconnect()

    return new Response(
      JSON.stringify({ success: true, message: 'Sync completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 