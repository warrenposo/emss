declare module 'node-zklib' {
  interface ZKOptions {
    ip: string;
    port?: number;
    inPort?: number;
    timeout?: number;
  }

  interface ZKUser {
    uid: number;
    id: string;
    name: string;
    cardno: string;
    role: number;
  }

  interface ZKAttendance {
    id: string;
    timestamp: Date;
    uid: number;
    type: number;
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
    getUsers(): Promise<{ data: ZKUser[] }>;
    getAttendance(): Promise<ZKAttendance[]>;
    getInfo(): Promise<{
      serialNumber: string;
      model: string;
      version: string;
    }>;
    connect(): Promise<void>;
  }

  export = ZKLib;
} 