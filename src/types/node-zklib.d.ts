declare module 'node-zklib' {
  interface ZKOptions {
    ip: string;
    port: number;
    inport: number;
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
    connect(): Promise<void>;
  }

  export = ZKLib;
} 