declare module '../node-zklib-master/zklib' {
  interface ZKUser {
    id: string;
    name: string;
    cardno: string;
    role: number;
  }

  interface ZKAttendance {
    userId: string;
    timestamp: string;
    verifyType: number;
    status: number;
  }

  interface ZKDeviceInfo {
    logCapacity: number;
    userCount: number;
    logsCount: number;
    deviceName: string;
    serialNumber: string;
    platform: string;
    firmwareVersion: string;
  }

  class ZKLib {
    constructor(ip: string, port: number, timeout: number, inport?: number);
    
    createSocket(cbErr?: (error: Error) => void, cbClose?: () => void): Promise<void>;
    disconnect(): Promise<void>;
    getInfo(): Promise<ZKDeviceInfo>;
    getUsers(): Promise<{ data: ZKUser[] }>;
    getAttendances(): Promise<{ data: ZKAttendance[] }>;
    getRealTimeLogs(callback: (data: any) => void): Promise<void>;
    freeData(): Promise<void>;
    getTime(): Promise<string>;
    disableDevice(): Promise<void>;
    enableDevice(): Promise<void>;
    getSocketStatus(): Promise<boolean>;
    clearAttendanceLog(): Promise<void>;
    executeCmd(command: number, data?: string): Promise<any>;
  }

  export default ZKLib;
} 