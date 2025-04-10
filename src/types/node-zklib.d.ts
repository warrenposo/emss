declare module 'node-zklib' {
  export interface ZKUser {
    uid: number;
    id: string;
    name: string;
    cardno: string;
    role: number;
  }

  export interface ZKResponse {
    data: ZKUser[];
  }

  export interface DeviceInfo {
    serialNumber: string;
    model: string;
    version: string;
  }

  export class ZKLib {
    constructor(ip: string, port: number, timeout?: number);
    createSocket(): Promise<void>;
    disconnect(): Promise<void>;
    getUsers(): Promise<ZKResponse>;
    getInfo(): Promise<DeviceInfo>;
    getAttendance(): Promise<any[]>;
    connect(): Promise<void>;
  }
} 