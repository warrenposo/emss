<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../zkteco-sdk-php-master/ZkLib.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_attendance':
            $zk = new ZKLib('192.168.100.51', 4370);
            $ret = $zk->connect();
            
            if ($ret) {
                $attendance = $zk->getAttendance();
                $zk->disconnect();
                
                echo json_encode([
                    'success' => true,
                    'data' => array_map(function($record) {
                        return [
                            'id' => $record[0],
                            'user_id' => $record[1],
                            'punch_time' => $record[3],
                            'verify_type' => $record[4],
                            'temperature' => $record[5] ?? null,
                            'status' => $record[6] ?? '',
                            'remark' => $record[7] ?? null
                        ];
                    }, $attendance)
                ]);
            } else {
                throw new Exception('Failed to connect to device');
            }
            break;

        case 'get_users':
            $zk = new ZKLib('192.168.100.51', 4370);
            $ret = $zk->connect();
            
            if ($ret) {
                $users = $zk->getUser();
                $zk->disconnect();
                
                echo json_encode([
                    'success' => true,
                    'data' => array_map(function($user) {
                        return [
                            'user_id' => $user[0],
                            'name' => $user[1],
                            'card_number' => $user[2],
                            'role' => $user[3],
                            'password' => $user[4],
                            'user_id_str' => $user[5]
                        ];
                    }, $users)
                ]);
            } else {
                throw new Exception('Failed to connect to device');
            }
            break;

        case 'get_device_info':
            $zk = new ZKLib('192.168.100.51', 4370);
            $ret = $zk->connect();
            
            if ($ret) {
                $deviceName = $zk->getDeviceName();
                $serialNumber = $zk->getSerialNumber();
                $platform = $zk->getPlatform();
                $firmwareVersion = $zk->getFirmwareVersion();
                $zk->disconnect();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'deviceName' => $deviceName,
                        'serialNumber' => $serialNumber,
                        'platform' => $platform,
                        'firmwareVersion' => $firmwareVersion,
                        'ipAddress' => '192.168.100.51',
                        'port' => 4370
                    ]
                ]);
            } else {
                throw new Exception('Failed to connect to device');
            }
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 