declare module '@zkteco/zklib' {
  interface ZKOptions {
    ip: string;
    port: number;
    inPort?: number;
    timeout?: number;
  }

  interface ZKUser {
    uid: string;
    id: string;
    name: string;
    cardno: string;
    role: number;
    fingerprint_data: any;
  }

  interface ZKResponse {
    data: ZKUser[];
  }

  interface DeviceInfo {
    serialNumber: string;
    model: string;
    version: string;
  }

  export default class ZKLib {
    constructor(options: ZKOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getUsers(): Promise<ZKResponse>;
    getDeviceInfo(): Promise<DeviceInfo>;
    getAttendance(): Promise<any[]>;
  }
} 