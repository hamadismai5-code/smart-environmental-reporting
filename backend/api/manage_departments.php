<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_admin();

<?php
require_once __DIR__ . "/../config/cors.php";

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

try {

    if ($method === "GET") {

        $stmt = $pdo->query("
            SELECT
                d.id,
                d.name,
                d.description,
                d.created_at,
                COUNT(DISTINCT o.id) AS officers_count,
                COUNT(DISTINCT r.id) AS reports_count
            FROM departments d

            LEFT JOIN officers o
                ON o.department_id = d.id

            LEFT JOIN reports r
                ON r.department_id = d.id

            GROUP BY
                d.id,
                d.name,
                d.description,
                d.created_at

            ORDER BY d.id DESC
        ");

        $departments = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "departments" => $departments
        ]);

        exit;
    }


    if ($method === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $name = trim(
            $input["name"] ?? ""
        );

        $description = trim(
            $input["description"] ?? ""
        );

        if ($name === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Department name is required."
            ]);

            exit;
        }

        $check = $pdo->prepare("
            SELECT id
            FROM departments
            WHERE name = ?
            LIMIT 1
        ");

        $check->execute([$name]);

        if ($check->fetch()) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "This department already exists."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO departments
            (name, description)
            VALUES (?, ?)
        ");

        $stmt->execute([
            $name,
            $description
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Department created successfully.",
            "id" => $pdo->lastInsertId()
        ]);

        exit;
    }


    if ($method === "PUT") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $id = intval(
            $input["id"] ?? 0
        );

        $name = trim(
            $input["name"] ?? ""
        );

        $description = trim(
            $input["description"] ?? ""
        );

        if ($id <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid department ID."
            ]);

            exit;
        }

        if ($name === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Department name is required."
            ]);

            exit;
        }

        $check = $pdo->prepare("
            SELECT id
            FROM departments
            WHERE name = ?
            AND id != ?
            LIMIT 1
        ");

        $check->execute([
            $name,
            $id
        ]);

        if ($check->fetch()) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Another department already has this name."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE departments
            SET
                name = ?,
                description = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $name,
            $description,
            $id
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Department updated successfully."
        ]);

        exit;
    }


    if ($method === "DELETE") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $id = intval(
            $input["id"] ?? 0
        );

        if ($id <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid department ID."
            ]);

            exit;
        }

        $officerCheck = $pdo->prepare("
            SELECT COUNT(*)
            FROM officers
            WHERE department_id = ?
        ");

        $officerCheck->execute([$id]);

        $officerCount =
            (int) $officerCheck->fetchColumn();

        if ($officerCount > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" =>
                    "This department cannot be deleted because it has officers assigned to it."
            ]);

            exit;
        }

        $reportCheck = $pdo->prepare("
            SELECT COUNT(*)
            FROM reports
            WHERE department_id = ?
        ");

        $reportCheck->execute([$id]);

        $reportCount =
            (int) $reportCheck->fetchColumn();

        if ($reportCount > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" =>
                    "This department cannot be deleted because it has reports assigned to it."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            DELETE FROM departments
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        echo json_encode([
            "success" => true,
            "message" => "Department deleted successfully."
        ]);

        exit;
    }


    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database operation failed."
    ]);
}
