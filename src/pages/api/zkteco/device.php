<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../../zkteco-sdk-php-master/zklib/zklib.php';

$response = ['success' => false, 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action']) && isset($data['ip']) && isset($data['port'])) {
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
        }
    }
}

echo json_encode($response); 