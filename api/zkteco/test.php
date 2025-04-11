<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../zkteco-sdk-php-master/ZkLib.php';

$deviceIp = '192.168.100.51';
$devicePort = 4370;

try {
    // Test device connection
    $zk = new ZKLib($deviceIp, $devicePort);
    $ret = $zk->connect();
    
    if ($ret) {
        // Test device info
        $deviceName = $zk->getDeviceName();
        $serialNumber = $zk->getSerialNumber();
        $platform = $zk->getPlatform();
        $firmwareVersion = $zk->getFirmwareVersion();
        
        // Test attendance records
        $attendance = $zk->getAttendance();
        
        // Test user data
        $users = $zk->getUser();
        
        $zk->disconnect();
        
        echo json_encode([
            'success' => true,
            'message' => 'Device connection successful',
            'device_info' => [
                'name' => $deviceName,
                'serial_number' => $serialNumber,
                'platform' => $platform,
                'firmware_version' => $firmwareVersion
            ],
            'attendance_records' => count($attendance),
            'users' => count($users)
        ]);
    } else {
        throw new Exception('Failed to connect to device');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'device_info' => [
            'ip' => $deviceIp,
            'port' => $devicePort
        ]
    ]);
} 