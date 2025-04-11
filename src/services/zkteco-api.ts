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

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  async getAttendance(): Promise<ZKTecoResponse<DeviceAttendanceRecord[]>> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}?action=get_attendance`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch attendance records');
      }

      return data;
    } catch (error) {
      console.error('Attendance fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attendance records'
      };
    }
  }

  async getUsers(): Promise<ZKTecoResponse<DeviceUser[]>> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}?action=get_users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      console.error('Users fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  async getDeviceInfo(): Promise<ZKTecoResponse<DeviceInfo>> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}?action=get_device_info`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch device info');
      }

      return data;
    } catch (error) {
      console.error('Device info fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch device info'
      };
    }
  }
}

export const zktecoApiService = new ZKTecoApiService(); 