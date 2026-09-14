<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");


try {

    /* ==============================
       TOTAL REPORTS
    ============================== */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS total
        FROM reports
    ");

    $totalReports = (int) $stmt->fetch()["total"];


    /* ==============================
       REPORTS BY STATUS
    ============================== */

    $stmt = $pdo->query("
        SELECT
            status,
            COUNT(*) AS total
        FROM reports
        GROUP BY status
        ORDER BY total DESC
    ");

    $statusRows = $stmt->fetchAll();

    $statuses = [];

    foreach ($statusRows as $row) {

        $statuses[$row["status"]] =
            (int) $row["total"];
    }


    /* ==============================
       REPORTS BY DEPARTMENT
    ============================== */

    $stmt = $pdo->query("
        SELECT
            d.id,
            d.name,
            COUNT(r.id) AS total
        FROM departments d
        LEFT JOIN reports r
            ON r.department_id = d.id
        GROUP BY
            d.id,
            d.name
        ORDER BY total DESC
    ");

    $departmentRows = $stmt->fetchAll();


    /* ==============================
       REPORTS BY CATEGORY
    ============================== */

    $stmt = $pdo->query("
        SELECT
            c.id,
            c.name,
            COUNT(r.id) AS total
        FROM categories c
        LEFT JOIN reports r
            ON r.category_id = c.id
        GROUP BY
            c.id,
            c.name
        ORDER BY total DESC
    ");

    $categoryRows = $stmt->fetchAll();


    /* ==============================
       MONTHLY REPORTS
    ============================== */

    $stmt = $pdo->query("
        SELECT
            DATE_FORMAT(
                created_at,
                '%Y-%m'
            ) AS month,
            COUNT(*) AS total
        FROM reports
        WHERE created_at >=
            DATE_SUB(
                CURDATE(),
                INTERVAL 11 MONTH
            )
        GROUP BY month
        ORDER BY month ASC
    ");

    $monthlyRows = $stmt->fetchAll();


    /* ==============================
       TODAY
    ============================== */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS total
        FROM reports
        WHERE DATE(created_at) = CURDATE()
    ");

    $todayReports =
        (int) $stmt->fetch()["total"];


    /* ==============================
       THIS MONTH
    ============================== */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS total
        FROM reports
        WHERE YEAR(created_at) = YEAR(CURDATE())
        AND MONTH(created_at) = MONTH(CURDATE())
    ");

    $monthReports =
        (int) $stmt->fetch()["total"];


    /* ==============================
       RESPONSE
    ============================== */

    echo json_encode([
        "success" => true,

        "summary" => [
            "total_reports" => $totalReports,

            "sent" =>
                $statuses["Sent"] ?? 0,

            "received" =>
                $statuses["Received"] ?? 0,

            "under_review" =>
                $statuses["Under Review"] ?? 0,

            "in_progress" =>
                $statuses["In Progress"] ?? 0,

            "resolved" =>
                $statuses["Resolved"] ?? 0,

            "rejected" =>
                $statuses["Rejected"] ?? 0,

            "today" =>
                $todayReports,

            "this_month" =>
                $monthReports
        ],

        "statuses" =>
            $statusRows,

        "departments" =>
            $departmentRows,

        "categories" =>
            $categoryRows,

        "monthly" =>
            $monthlyRows
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Unable to load analytics data."
    ]);
}
