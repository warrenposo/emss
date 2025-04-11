<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log the request for debugging
file_put_contents('php://stderr', "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n");
file_put_contents('php://stderr', "Content type: " . $_SERVER['CONTENT_TYPE'] . "\n");

// Get the raw input data
$rawData = '';
if (php_sapi_name() === 'cli') {
    // Running from command line
    $rawData = file_get_contents('php://stdin');
} else {
    // Running as web server
    $rawData = file_get_contents('php://input');
}

file_put_contents('php://stderr', "Raw input data: " . $rawData . "\n");

// Try to include the ZKTeco library
$zkLibPath = __DIR__ . '/../../../../zkteco-sdk-php-master/zklib/zklib.php';
file_put_contents('php://stderr', "ZKLib path: " . $zkLibPath . "\n");

if (!file_exists($zkLibPath)) {
    echo json_encode([
        'success' => false,
        'message' => 'ZKTeco library not found at: ' . $zkLibPath
    ]);
    exit;
}

require_once $zkLibPath;

$response = ['success' => false, 'message' => 'Invalid request'];

if (!empty($rawData)) {
    $data = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        $response = [
            'success' => false,
            'message' => 'Invalid JSON data: ' . json_last_error_msg()
        ];
    } else if (isset($data['action']) && isset($data['ip']) && isset($data['port'])) {
        file_put_contents('php://stderr', "Action: " . $data['action'] . "\n");
        file_put_contents('php://stderr', "IP: " . $data['ip'] . "\n");
        file_put_contents('php://stderr', "Port: " . $data['port'] . "\n");
        
        $zk = new ZKLib($data['ip'], $data['port']);
        
        try {
            switch ($data['action']) {
                case 'connect':
                    $result = $zk->connect();
                    $response = [
                        'success' => $result,
                        'message' => $result ? 'Connected successfully' : 'Connection failed'
                    ];
                    break;
                    
                case 'getAttendance':
                    if ($zk->connect()) {
                        $attendance = $zk->getAttendance();
                        $formattedAttendance = [];
                        
                        foreach ($attendance as $idx => $record) {
                            $formattedAttendance[] = [
                                'uid' => $record[0],
                                'id' => $record[1],
                                'status' => $record[2] == 14 ? 'Check Out' : 'Check In',
                                'timestamp' => $record[3]
                            ];
                        }
                        
                        $response = [
                            'success' => true,
                            'data' => $formattedAttendance
                        ];
                    }
                    break;
                    
                case 'getUsers':
                    if ($zk->connect()) {
                        $users = $zk->getUser();
                        $formattedUsers = [];
                        
                        foreach ($users as $uid => $userData) {
                            $formattedUsers[] = [
                                'uid' => $uid,
                                'id' => $userData[0],
                                'name' => $userData[1],
                                'role' => $userData[2] == 14 ? 'Admin' : 'User',
                                'password' => $userData[3]
                            ];
                        }
                        
                        $response = [
                            'success' => true,
                            'data' => $formattedUsers
                        ];
                    }
                    break;
                    
                case 'getDeviceInfo':
                    if ($zk->connect()) {
                        $response = [
                            'success' => true,
                            'data' => [
                                'version' => $zk->version(),
                                'platform' => $zk->platform(),
                                'serialNumber' => $zk->serialNumber(),
                                'deviceName' => $zk->deviceName()
                            ]
                        ];
                    }
                    break;
            }
            
            $zk->disconnect();
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => $e->getMessage()
            ];
            file_put_contents('php://stderr', "Exception: " . $e->getMessage() . "\n");
        }
    }
}

echo json_encode($response); 