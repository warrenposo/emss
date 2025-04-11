interface ZKTecoResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AttendanceRecord {
  uid: number;
  id: string;
  status: 'Check In' | 'Check Out';
  timestamp: string;
}

interface UserRecord {
  uid: number;
  id: string;
  name: string;
  role: 'Admin' | 'User';
  password: string;
}

interface DeviceInfo {
  version: string;
  platform: string;
  serialNumber: string;
  deviceName: string;
}

class ZKTecoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/zkteco/device.php';
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

      const data = await response.json() as ZKTecoResponse<T>;
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async connect(ip: string, port: number): Promise<ZKTecoResponse> {
    return this.request('connect', ip, port);
  }

  async getAttendance(ip: string, port: number): Promise<ZKTecoResponse<AttendanceRecord[]>> {
    return this.request<AttendanceRecord[]>('getAttendance', ip, port);
  }

  async getUsers(ip: string, port: number): Promise<ZKTecoResponse<UserRecord[]>> {
    return this.request<UserRecord[]>('getUsers', ip, port);
  }

  async getDeviceInfo(ip: string, port: number): Promise<ZKTecoResponse<DeviceInfo>> {
    return this.request<DeviceInfo>('getDeviceInfo', ip, port);
  }
}

export const zktecoService = new ZKTecoService(); 