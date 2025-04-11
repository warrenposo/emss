import { DeviceUser, DeviceAttendanceRecord, DeviceInfo } from '@/types/device';

export interface ZKTecoResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ZKTecoApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/zkteco/device.php') {
    this.baseUrl = baseUrl;
  }

  async getAttendance(): Promise<ZKTecoResponse<DeviceAttendanceRecord[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?action=get_attendance`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attendance records'
      };
    }
  }

  async getUsers(): Promise<ZKTecoResponse<DeviceUser[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?action=get_users`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  async getDeviceInfo(): Promise<ZKTecoResponse<DeviceInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}?action=get_device_info`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch device info'
      };
    }
  }
}

export const zktecoApiService = new ZKTecoApiService(); 