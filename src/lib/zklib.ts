import dgram from 'dgram';

// Command codes for F18
const CMD = {
  CONNECT: 1000,
  EXIT: 1001,
  ENABLEDEVICE: 1002,
  DISABLEDEVICE: 1003,
  RESTART: 1004,
  POWEROFF: 1005,
  GET_ATTENDANCE: 13,
  GET_DEVICE_INFO: 11,
  ACK_OK: 2000,
  ACK_ERROR: 2001,
  ACK_DATA: 2002,
};

export class ZKLib {
  private ip: string;
  private port: number;
  private timeout: number;
  private socket: dgram.Socket | null = null;
  private sessionId: number = 0;
  private replyId: number = 0;

  constructor(ip: string, port: number = 4370, timeout: number = 5000) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
  }

  public async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          reject(error);
        });

        this.socket.on('message', (msg, rinfo) => {
          if (this.parseResponse(msg)) {
            resolve(true);
          }
        });

        // Send connection command
        const command = this.createCommand(CMD.CONNECT);
        this.socket.send(command, 0, command.length, this.port, this.ip);

        // Set connection timeout
        setTimeout(() => {
          if (this.socket) {
            this.socket.close();
            reject(new Error('Connection timeout'));
          }
        }, this.timeout);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        const command = this.createCommand(CMD.EXIT);
        this.socket.send(command, 0, command.length, this.port, this.ip, () => {
          if (this.socket) {
            this.socket.close();
            this.socket = null;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public async getInfo(): Promise<any> {
    if (!this.socket) throw new Error('Not connected to device');

    return new Promise((resolve, reject) => {
      const command = this.createCommand(CMD.GET_DEVICE_INFO);
      
      this.socket!.once('message', (msg) => {
        const response = this.parseResponse(msg);
        if (response) {
          resolve({
            deviceName: 'F18',
            serialNumber: response.toString('ascii', 8, 16),
            platform: 'ZKTeco',
            firmware: response.toString('ascii', 16, 24),
            deviceTime: new Date().toISOString()
          });
        } else {
          reject(new Error('Invalid response from device'));
        }
      });

      this.socket.send(command, 0, command.length, this.port, this.ip);
    });
  }

  public async getAttendance(): Promise<any[]> {
    if (!this.socket) throw new Error('Not connected to device');

    return new Promise((resolve, reject) => {
      const command = this.createCommand(CMD.GET_ATTENDANCE);
      
      const records: any[] = [];
      
      this.socket!.on('message', (msg) => {
        const response = this.parseResponse(msg);
        if (response) {
          // Parse attendance records from response
          // Each record is 40 bytes
          for (let i = 0; i < response.length; i += 40) {
            const record = {
              userId: response.readUInt32LE(i + 0),
              timestamp: new Date(
                response.readUInt32LE(i + 4) * 1000
              ).toISOString(),
              verifyType: response.readUInt8(i + 28),
              status: response.readUInt8(i + 29)
            };
            records.push(record);
          }
          resolve(records);
        } else {
          reject(new Error('Invalid response from device'));
        }
      });

      this.socket.send(command, 0, command.length, this.port, this.ip);
    });
  }

  private createCommand(command: number): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeUInt16LE(command, 0);
    buf.writeUInt16LE(0, 2);  // checksum
    buf.writeUInt16LE(this.sessionId, 4);
    buf.writeUInt16LE(this.replyId, 6);
    return buf;
  }

  private parseResponse(response: Buffer): Buffer | null {
    if (response.length < 8) return null;

    const command = response.readUInt16LE(0);
    const checksum = response.readUInt16LE(2);
    const sessionId = response.readUInt16LE(4);
    const replyId = response.readUInt16LE(6);

    if (command === CMD.ACK_OK) {
      this.sessionId = sessionId;
      this.replyId = replyId;
      return response.slice(8);
    }

    return null;
  }
} 