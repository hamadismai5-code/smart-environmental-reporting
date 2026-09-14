<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_admin();

<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed"
    ]);

    exit;
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

$reportId = trim($input["report_id"] ?? "");
$departmentId = $input["department_id"] ?? null;
$officerId = $input["officer_id"] ?? null;
$status = trim($input["status"] ?? "");
$comment = trim($input["comment"] ?? "");

$allowedStatuses = [
    "Sent",
    "Received",
    "Under Review",
    "In Progress",
    "Resolved",
    "Rejected"
];

if ($reportId === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Report ID is required"
    ]);

    exit;
}

if ($status !== "" && !in_array($status, $allowedStatuses, true)) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid status"
    ]);

    exit;
}

try {

    // Check report
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

    $databaseReportId = $report["id"];

    // Validate department
    if ($departmentId !== null && $departmentId !== "") {

        $stmt = $pdo->prepare("
            SELECT id
            FROM departments
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$departmentId]);

        if (!$stmt->fetch()) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid department"
            ]);

            exit;
        }
    } else {
        $departmentId = null;
    }

    // Validate officer
    if ($officerId !== null && $officerId !== "") {

        $stmt = $pdo->prepare("
            SELECT id
            FROM officers
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$officerId]);

        if (!$stmt->fetch()) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid officer"
            ]);

            exit;
        }
    } else {
        $officerId = null;
    }

    $pdo->beginTransaction();

    // Get current report data
    $stmt = $pdo->prepare("
        SELECT
            status,
            department_id,
            assigned_officer_id
        FROM reports
        WHERE id = ?
        FOR UPDATE
    ");

    $stmt->execute([$databaseReportId]);

    $current = $stmt->fetch();

    $newStatus = $status !== ""
        ? $status
        : $current["status"];

    $newDepartmentId = $departmentId !== null
        ? $departmentId
        : $current["department_id"];

    $newOfficerId = $officerId !== null
        ? $officerId
        : $current["assigned_officer_id"];

    // Update report
    $stmt = $pdo->prepare("
        UPDATE reports
        SET
            department_id = ?,
            assigned_officer_id = ?,
            status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $newDepartmentId,
        $newOfficerId,
        $newStatus,
        $databaseReportId
    ]);

    // Add history record
    $historyComment = $comment;

    if ($historyComment === "") {

        $changes = [];

        if ($current["status"] !== $newStatus) {
            $changes[] =
                "Status changed from " .
                $current["status"] .
                " to " .
                $newStatus;
        }

        if ($current["department_id"] != $newDepartmentId) {
            $changes[] = "Department updated";
        }

        if ($current["assigned_officer_id"] != $newOfficerId) {
            $changes[] = "Officer assignment updated";
        }

        $historyComment = !empty($changes)
            ? implode(". ", $changes)
            : "Report information updated";
    }

    $stmt = $pdo->prepare("
        INSERT INTO report_updates (
            report_id,
            status,
            comment
        )
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $databaseReportId,
        $newStatus,
        $historyComment
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Report updated successfully",
        "report" => [
            "report_id" => $reportId,
            "status" => $newStatus,
            "department_id" => $newDepartmentId,
            "officer_id" => $newOfficerId
        ]
    ]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to update report"
    ]);
}
