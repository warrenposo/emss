<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'ZkLib.php';
require_once 'config.php';

$config = require 'config.php';
$deviceConfig = $config['device'];

function connectToDevice($ip, $port) {
    global $deviceConfig;
    $zk = new ZKLib($ip, $port);
    
    for ($attempt = 1; $attempt <= $deviceConfig['retry_attempts']; $attempt++) {
        if ($zk->connect()) {
            return $zk;
        }
        if ($attempt < $deviceConfig['retry_attempts']) {
            sleep($deviceConfig['retry_delay']);
        }
    }
    return false;
}

function getDeviceInfo($zk) {
    $info = [];
    $info['name'] = $zk->getDeviceName();
    $info['serial'] = $zk->getSerialNumber();
    $info['platform'] = $zk->getPlatform();
    $info['firmware'] = $zk->getFirmwareVersion();
    return $info;
}

function getAttendanceRecords($zk) {
    return $zk->getAttendance();
}

function getUserRecords($zk) {
    return $zk->getUser();
}

$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    $zk = connectToDevice($deviceConfig['ip'], $deviceConfig['port']);
    
    if (!$zk) {
        throw new Exception("Failed to connect to device at {$deviceConfig['ip']}:{$deviceConfig['port']}");
    }
    
    $response['success'] = true;
    $response['data'] = [
        'device_info' => getDeviceInfo($zk),
        'attendance_count' => count(getAttendanceRecords($zk)),
        'user_count' => count(getUserRecords($zk))
    ];
    
    $zk->disconnect();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("ZKTeco Error: " . $e->getMessage());
}

echo json_encode($response); 