declare module 'node-zklib-ng' {
  export interface ZKUser {
    uid: number;
    id: string;
    name: string;
    cardno: string;
    role: number;
  }

  export interface DeviceInfo {
    serialNumber: string;
    model: string;
    version: string;
  }

  export class ZKLib {
    constructor(ip: string, port: number);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getUsers(): Promise<ZKUser[]>;
    getInfo(): Promise<DeviceInfo>;
    getAttendance(): Promise<any[]>;
  }
} 