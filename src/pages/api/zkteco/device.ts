import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { action, ip, port } = req.body;

    if (!action || !ip || !port) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    // Execute the PHP script with the provided parameters
    const { stdout, stderr } = await execAsync(
      `php ${process.cwd()}/src/pages/api/zkteco/device.php`,
      {
        env: {
          ...process.env,
          REQUEST_METHOD: 'POST',
          CONTENT_TYPE: 'application/json',
          HTTP_ACTION: action,
          HTTP_IP: ip,
          HTTP_PORT: port.toString(),
        },
      }
    );

    if (stderr) {
      console.error('PHP Error:', stderr);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    // Parse the PHP output as JSON
    const response = JSON.parse(stdout);
    return res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 