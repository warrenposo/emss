export interface DeviceUser {
  user_id: string;
  name: string;
  card_number: string;
  role: number;
  password: string;
  user_id_str: string;
}

export interface DeviceAttendanceRecord {
  id: string;
  user_id: string;
  punch_time: string;
  verify_type: string;
  temperature: number | null;
  status: string;
  remark: string | null;
}

export interface DeviceInfo {
  deviceName: string;
  serialNumber: string;
  platform: string;
  firmwareVersion: string;
  ipAddress: string;
  port: number;
} 