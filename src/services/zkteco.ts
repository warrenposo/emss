interface ZKTecoResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AttendanceRecord {
  uid: number;
  id: string;
  status: string;
  timestamp: string;
}

interface UserRecord {
  uid: number;
  id: string;
  name: string;
  role: string;
  password: string;
}

interface DeviceInfo {
  version: string;
  platform: string;
  serialNumber: string;
  deviceName: string;
}

class ZKTecoService {
  private baseUrl = '/api/zkteco/device';

  async connect(ip: string, port: number): Promise<ZKTecoResponse> {
    return this.request('connect', ip, port);
  }

  async getAttendanceRecords(ip: string, port: number): Promise<ZKTecoResponse<AttendanceRecord[]>> {
    return this.request<AttendanceRecord[]>('getAttendance', ip, port);
  }

  async getUserRecords(ip: string, port: number): Promise<ZKTecoResponse<UserRecord[]>> {
    return this.request<UserRecord[]>('getUsers', ip, port);
  }

  async getDeviceInfo(ip: string, port: number): Promise<ZKTecoResponse<DeviceInfo>> {
    return this.request<DeviceInfo>('getDeviceInfo', ip, port);
  }

  private async request<T>(action: string, ip: string, port: number): Promise<ZKTecoResponse<T>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ip, port }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ZKTecoResponse<T>;
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const zktecoService = new ZKTecoService(); 