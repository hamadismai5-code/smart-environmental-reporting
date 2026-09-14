<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_admin();

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
        SELECT id
        FROM reports
        WHERE report_id = ?
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

    $stmt = $pdo->prepare("
        SELECT
            ru.id,
            ru.status,
            ru.comment,
            ru.created_at,
            o.full_name AS officer
        FROM report_updates ru
        LEFT JOIN officers o
            ON ru.updated_by = o.id
        WHERE ru.report_id = ?
        ORDER BY ru.created_at ASC, ru.id ASC
    ");

    $stmt->execute([
        $report["id"]
    ]);

    $history = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "report_id" => $reportId,
        "count" => count($history),
        "history" => $history
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load report history"
    ]);
}
