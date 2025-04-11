import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testDeviceConnection() {
  try {
    console.log('Testing connection to ZKTeco device...');
    console.log('IP: 192.168.100.51');
    console.log('Port: 4370');

    // First, try to ping the device
    console.log('\n1. Testing network connectivity...');
    const { stdout: pingOutput } = await execAsync('ping -n 4 192.168.100.51');
    console.log(pingOutput);

    // Test PHP script execution with proper POST data
    console.log('\n2. Testing PHP script...');
    const postData = JSON.stringify({
      action: 'connect',
      ip: '192.168.100.51',
      port: 4370
    });

    // Create a temporary file with the POST data
    const tempFile = 'temp_post_data.json';
    require('fs').writeFileSync(tempFile, postData);

    try {
      // Test PHP script with the temporary file
      const { stdout: scriptOutput } = await execAsync(
        `php src/pages/api/zkteco/device.php < ${tempFile}`,
        {
          env: {
            ...process.env,
            REQUEST_METHOD: 'POST',
            CONTENT_TYPE: 'application/json',
          },
        }
      );
      console.log('PHP Script Output:', scriptOutput);

      // Test API endpoint with proper headers and data
      console.log('\n3. Testing API endpoint...');
      const response = await fetch('http://localhost:3006/api/zkteco/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

    } finally {
      // Clean up the temporary file
      require('fs').unlinkSync(tempFile);
    }

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('stack' in error) {
        console.error('Stack trace:', error.stack);
      }
    }
  }
}

testDeviceConnection(); 