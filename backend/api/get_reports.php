<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

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
            r.report_id,
            c.name AS problem_type,
            r.description,
            r.location,
            r.latitude,
            r.longitude,
            r.image_path,
            r.status,
            r.created_at
        FROM reports r
        INNER JOIN categories c
            ON r.category_id = c.id
        WHERE r.latitude IS NOT NULL
        AND r.longitude IS NOT NULL
        ORDER BY r.created_at DESC
    ");

    $reports = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($reports),
        "reports" => $reports
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve reports"
    ]);
}
