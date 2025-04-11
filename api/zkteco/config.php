<?php
return [
    'device' => [
        'ip' => '192.168.100.51',
        'port' => 4370,
        'timeout' => 10, // seconds
        'retry_attempts' => 3,
        'retry_delay' => 1 // seconds
    ],
    'api' => [
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
        'allowed_headers' => ['Content-Type'],
        'max_request_time' => 30 // seconds
    ]
]; 