import ZKLib from '../node-zklib-master/zklib';

async function testDeviceConnection() {
  try {
    // Updated IP address to match the working device
    const ipAddress = '192.168.0.11';
    const port = 4370;
    const timeout = 10000;

    console.log(`Attempting to connect to device at ${ipAddress}:${port}`);

    const zkInstance = new ZKLib(ipAddress, port, timeout, 4000);

    // Create socket and connect
    await zkInstance.createSocket((error) => {
      console.error('Socket error:', error);
    }, () => {
      console.log('Socket closed');
    });
    console.log('Successfully connected to device');

    // Get device info
    const deviceInfo = await zkInstance.getInfo();
    console.log('Device Info:', {
      name: deviceInfo.deviceName,
      serial: deviceInfo.serialNumber,
      platform: deviceInfo.platform,
      firmware: deviceInfo.firmwareVersion,
      users: deviceInfo.userCount,
      logs: deviceInfo.logsCount
    });

    // Get users
    const { data: users } = await zkInstance.getUsers();
    console.log(`Found ${users.length} users`);
    users.forEach(user => {
      console.log(`User: ${user.name} (ID: ${user.id}, Card: ${user.cardno}, Role: ${user.role})`);
    });

    // Get attendance records
    const { data: attendances } = await zkInstance.getAttendances();
    console.log(`Found ${attendances.length} attendance records`);
    attendances.forEach(record => {
      console.log(`Attendance: User ${record.userId} at ${record.timestamp} (Type: ${record.verifyType}, Status: ${record.status})`);
    });

    // Disconnect
    await zkInstance.disconnect();
    console.log('Disconnected from device');

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Run the test
testDeviceConnection(); 