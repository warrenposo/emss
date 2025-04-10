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

  constructor(ip: string, port: number = 4370) {
    this.ip = ip;
    this.port = port;
  }

  private createChkSum(buf: Buffer): number {
    let chksum = 0;
    for (let i = 0; i < buf.length; i += 2) {
      if (i + 1 < buf.length) {
        chksum += buf.readUInt16LE(i);
      }
    }
    chksum %= USHRT_MAX;
    chksum = USHRT_MAX - chksum - 1;
    return chksum;
  }

  private createHeader(command: number, commandString: string, sessionId: number): Buffer {
    const buf = Buffer.alloc(8 + commandString.length);
    
    // Write command
    buf.writeUInt16LE(command, 0);
    
    // Write checksum
    buf.writeUInt16LE(0, 2);
    
    // Write session ID
    buf.writeUInt16LE(sessionId, 4);
    
    // Write reply ID
    buf.writeUInt16LE(this.replyId, 6);
    
    // Write command string
    buf.write(commandString, 8);
    
    // Calculate checksum
    const chksum = this.createChkSum(buf);
    buf.writeUInt16LE(chksum, 2);
    
    return buf;
  }

  public async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = dgram.createSocket('udp4');
        
        this.socket.on('message', (msg: Buffer) => {
          const command = msg.readUInt16LE(0);
          if (command === CMD_ACK_OK) {
            this.sessionId = msg.readUInt16LE(4);
            resolve(true);
          } else {
            reject(new Error('Connection failed'));
          }
        });

        this.socket.on('error', (err) => {
          reject(err);
        });

        const buf = this.createHeader(CMD_CONNECT, '', 0);
        this.socket.send(buf, 0, buf.length, this.port, this.ip);
      } catch (err) {
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

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
} 