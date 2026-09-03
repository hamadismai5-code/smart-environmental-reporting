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

$reportId = trim($_GET["report_id"] ?? "");

if ($reportId === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Report ID is required"
    ]);

    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.report_id,
            c.name AS problem_type,
            r.description,
            r.location,
            r.latitude,
            r.longitude,
            r.image_path,
            r.status,
            r.created_at,
            r.updated_at,
            d.name AS department,
            o.full_name AS officer
        FROM reports r

        INNER JOIN categories c
            ON r.category_id = c.id

        LEFT JOIN departments d
            ON r.department_id = d.id

        LEFT JOIN officers o
            ON r.assigned_officer_id = o.id

        WHERE r.report_id = ?

        LIMIT 1
    ");

    $stmt->execute([$reportId]);

    $report = $stmt->fetch();

    if (!$report) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Report not found"
        ]);

        exit;
    }

    $updateStmt = $pdo->prepare("
        SELECT
            status,
            comment,
            created_at
        FROM report_updates
        WHERE report_id = ?
        ORDER BY created_at ASC
    ");

    $updateStmt->execute([$report["id"]]);

    $updates = $updateStmt->fetchAll();

    echo json_encode([
        "success" => true,
        "report" => $report,
        "updates" => $updates
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve report"
    ]);
}
