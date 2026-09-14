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

    $status = trim($_GET["status"] ?? "");
    $search = trim($_GET["search"] ?? "");

    $sql = "
        SELECT
            r.id,
            r.report_id,
            c.name AS problem_type,
            c.description AS category_description,
            r.description,
            r.location,
            r.latitude,
            r.longitude,
            r.image_path,
            r.status,
            r.created_at,
            r.updated_at,

            d.id AS department_id,
            d.name AS department,

            o.id AS officer_id,
            o.full_name AS officer

        FROM reports r

        INNER JOIN categories c
            ON r.category_id = c.id

        LEFT JOIN departments d
            ON r.department_id = d.id

        LEFT JOIN officers o
            ON r.assigned_officer_id = o.id

        WHERE 1 = 1
    ";

    $params = [];

    if ($status !== "") {

        $sql .= " AND r.status = ?";

        $params[] = $status;
    }

    if ($search !== "") {

        $sql .= "
            AND (
                r.report_id LIKE ?
                OR c.name LIKE ?
                OR r.location LIKE ?
                OR r.description LIKE ?
            )
        ";

        $searchValue = "%" . $search . "%";

        $params[] = $searchValue;
        $params[] = $searchValue;
        $params[] = $searchValue;
        $params[] = $searchValue;
    }

    $sql .= "
        ORDER BY r.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

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

    exit;
}
