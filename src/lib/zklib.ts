import dgram from 'dgram';
import { Socket } from 'dgram';

// Constants from the PHP implementation
const CMD_CONNECT = 1000;
const CMD_EXIT = 1001;
const CMD_ENABLEDEVICE = 1002;
const CMD_DISABLEDEVICE = 1003;
const CMD_ACK_OK = 2000;
const CMD_ACK_ERROR = 2001;
const CMD_ACK_DATA = 2002;
const USHRT_MAX = 65535;

export default class ZKLib {
  private ip: string;
  private port: number;
  private socket: Socket | null = null;
  private sessionId: number = 0;
  private replyId: number = 0;
  private timeout: number = 5000;
  private protocol: 'UDP' | 'TCP' = 'UDP';
  private timeoutTimer: NodeJS.Timeout | null = null;

  constructor(ip: string, port: number = 4370, timeout: number = 5000) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
  }

  private createHeader(command: number, commandString: string = '', sessionId: number = 0): Buffer {
    const buf = Buffer.alloc(8 + commandString.length);
    buf.writeUInt16LE(command, 0);
    buf.writeUInt16LE(0, 2); // checksum
    buf.writeUInt16LE(sessionId, 4);
    buf.writeUInt16LE(this.replyId, 6);
    if (commandString.length > 0) {
      buf.write(commandString, 8);
    }
    return buf;
  }

  private clearTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  public async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Create UDP socket
        this.socket = dgram.createSocket('udp4');
        
        // Handle socket errors
        this.socket.on('error', (err) => {
          console.error('Socket error:', err);
          this.clearTimeoutTimer();
          reject(err);
        });

        // Handle incoming messages
        this.socket.on('message', (msg: Buffer) => {
          this.clearTimeoutTimer();
          const command = msg.readUInt16LE(0);
          if (command === CMD_ACK_OK) {
            this.sessionId = msg.readUInt16LE(4);
            console.log('Connection established with session ID:', this.sessionId);
            resolve(true);
          } else {
            reject(new Error('Connection failed - Invalid response'));
          }
        });

        // Set timeout for connection
        this.timeoutTimer = setTimeout(() => {
          console.error('Connection timeout');
          this.socket?.close();
          this.socket = null;
          reject(new Error('Connection timeout'));
        }, this.timeout);

        // Send connection request
        const buf = this.createHeader(CMD_CONNECT);
        this.socket.send(buf, 0, buf.length, this.port, this.ip, (err) => {
          if (err) {
            console.error('Send error:', err);
            this.clearTimeoutTimer();
            reject(err);
          }
        });

      } catch (err) {
        console.error('Connection error:', err);
        this.clearTimeoutTimer();
        reject(err);
      }
    });
  }

  public async enableDevice(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      try {
        const buf = this.createHeader(CMD_ENABLEDEVICE, '', this.sessionId);
        this.socket.send(buf, 0, buf.length, this.port, this.ip, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async disableDevice(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      try {
        const buf = this.createHeader(CMD_DISABLEDEVICE, '', this.sessionId);
        this.socket.send(buf, 0, buf.length, this.port, this.ip, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        const buf = this.createHeader(CMD_EXIT, '', this.sessionId);
        this.socket.send(buf, 0, buf.length, this.port, this.ip);
        this.socket.close();
        this.socket = null;
        this.sessionId = 0;
        this.clearTimeoutTimer();
      } catch (err) {
        console.error('Error during disconnect:', err);
      }
    }
  }

  public async getInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      try {
        // Implement device info retrieval
        // This is a placeholder - implement actual device info retrieval
        resolve({
          serialNumber: 'N/A',
          model: 'ZKTeco Device',
          version: '1.0'
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async getAttendance(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      try {
        // Implement attendance data retrieval
        // This is a placeholder - implement actual attendance retrieval
        resolve([]);
      } catch (err) {
        reject(err);
      }
    });
  }
} 