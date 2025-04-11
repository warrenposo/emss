import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

/**
 * BIOMETRIC INTEGRATION POINT
 * 
 * This is where you can add your biometric API integration.
 * Example implementation:
 * 
 * export const sendBiometricData = async (data) => {
 *   // Implement your biometric API call here
 *   // Example: const response = await fetch('your-biometric-api-url', {...});
 *   // Return the response
 * }
 */
export const connectBiometricDevice = async (deviceId: string, config = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-device', {
      body: {
        deviceId,
        ...config
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error connecting to biometric device:', error);
    throw error;
  }
};

export const receiveBiometricData = async (data: any) => {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .upsert(data);

    if (error) throw error;
    return { success: true, message: 'Attendance data stored successfully' };
  } catch (error) {
    console.error('Error storing biometric data:', error);
    throw error;
  }
};
