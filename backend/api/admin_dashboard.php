<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_admin();

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET requests are allowed"
    ]);

    exit;
}

try {

    // -------------------------------------------------
    // 1. Total reports
    // -------------------------------------------------

    $stmt = $pdo->query("
        SELECT COUNT(*) AS total
        FROM reports
    ");

    $totalReports = (int) $stmt->fetch()["total"];


    // -------------------------------------------------
    // 2. Reports by status
    // -------------------------------------------------

    $stmt = $pdo->query("
        SELECT
            status,
            COUNT(*) AS total
        FROM reports
        GROUP BY status
        ORDER BY total DESC
    ");

    $statusSummary = [];

    foreach ($stmt->fetchAll() as $row) {

        $statusSummary[] = [
            "status" => $row["status"],
            "total" => (int) $row["total"]
        ];
    }


    // -------------------------------------------------
    // 3. Reports by category
    // -------------------------------------------------

    $stmt = $pdo->query("
        SELECT
            c.name AS category,
            COUNT(r.id) AS total
        FROM categories c
        LEFT JOIN reports r
            ON r.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY total DESC
    ");

    $categorySummary = [];

    foreach ($stmt->fetchAll() as $row) {

        $categorySummary[] = [
            "category" => $row["category"],
            "total" => (int) $row["total"]
        ];
    }


    // -------------------------------------------------
    // 4. Reports by department
    // -------------------------------------------------

    $stmt = $pdo->query("
        SELECT
            d.name AS department,
            COUNT(r.id) AS total
        FROM departments d
        LEFT JOIN reports r
            ON r.department_id = d.id
        GROUP BY d.id, d.name
        ORDER BY total DESC
    ");

    $departmentSummary = [];

    foreach ($stmt->fetchAll() as $row) {

        $departmentSummary[] = [
            "department" => $row["department"],
            "total" => (int) $row["total"]
        ];
    }


    // -------------------------------------------------
    // 5. Recent reports
    // -------------------------------------------------

    $stmt = $pdo->query("
        SELECT
            r.report_id,
            c.name AS category,
            r.location,
            r.status,
            r.created_at
        FROM reports r
        INNER JOIN categories c
            ON c.id = r.category_id
        ORDER BY r.created_at DESC
        LIMIT 10
    ");

    $recentReports = $stmt->fetchAll();


    // -------------------------------------------------
    // 6. Final response
    // -------------------------------------------------

    echo json_encode([
        "success" => true,
        "total_reports" => $totalReports,
        "status_summary" => $statusSummary,
        "category_summary" => $categorySummary,
        "department_summary" => $departmentSummary,
        "recent_reports" => $recentReports
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load dashboard data"
    ]);

    exit;
}
