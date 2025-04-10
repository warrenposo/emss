declare module '@zkteco/zklib' {
  interface ZKOptions {
    ip: string;
    port: number;
    inPort: number;
    timeout?: number;
  }

  interface ZKUser {
    uid: number;
    id: string;
    name: string;
    cardno: string;
    role: number;
  }

  interface ZKResponse {
    data: ZKUser[];
  }

  interface DeviceInfo {
    serialNumber: string;
    model: string;
    version: string;
  }

  class ZKLib {
    constructor(options: ZKOptions);
    createSocket(): Promise<void>;
    disconnect(): Promise<void>;
    getUsers(): Promise<ZKResponse>;
    getInfo(): Promise<DeviceInfo>;
    getAttendance(): Promise<any[]>;
  }

  export default ZKLib;
} 