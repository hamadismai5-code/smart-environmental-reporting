<?php
require_once __DIR__ . "/cors.php";

header("Content-Type: application/json; charset=UTF-8");

$envFile = __DIR__ . "/../../.env";

if (!file_exists($envFile)) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Environment configuration file not found"
    ]);

    exit;
}

$env = parse_ini_file($envFile);

if ($env === false) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to read environment configuration"
    ]);

    exit;
}

$host = $env["DB_HOST"] ?? "127.0.0.1";
$dbname = $env["DB_NAME"] ?? "";
$username = $env["DB_USER"] ?? "";
$password = $env["DB_PASSWORD"] ?? "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);

    exit;
}
