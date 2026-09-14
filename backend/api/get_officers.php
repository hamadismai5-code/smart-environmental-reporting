<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET requests are allowed"
    ]);

    exit;
}

try {

    $stmt = $pdo->query("
        SELECT
            o.id,
            o.full_name,
            o.email,
            o.phone,
            o.department_id,
            d.name AS department
        FROM officers o
        LEFT JOIN departments d
            ON o.department_id = d.id
        ORDER BY o.full_name ASC
    ");

    $officers = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($officers),
        "officers" => $officers
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load officers"
    ]);
}
