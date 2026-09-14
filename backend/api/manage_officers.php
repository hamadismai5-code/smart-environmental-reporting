<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_admin();

<?php

require_once __DIR__ . "/../config/cors.php";

header("Content-Type: application/json; charset=UTF-8");

require_once "../config/database.php";

try {

    $method = $_SERVER["REQUEST_METHOD"];

    /*
    |--------------------------------------------------------------------------
    | GET - Get all officers
    |--------------------------------------------------------------------------
    */

    if ($method === "GET") {

        $sql = "
            SELECT
                o.id,
                o.full_name,
                o.email,
                o.phone,
                o.department_id,
                o.created_at,
                d.name AS department_name,
                COUNT(DISTINCT r.id) AS reports_count
            FROM officers o

            LEFT JOIN departments d
                ON o.department_id = d.id

            LEFT JOIN reports r
                ON r.assigned_officer_id = o.id

            GROUP BY
                o.id,
                o.full_name,
                o.email,
                o.phone,
                o.department_id,
                o.created_at,
                d.name

            ORDER BY o.id DESC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $officers = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "officers" => $officers
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Read JSON body
    |--------------------------------------------------------------------------
    */

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON request."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST - Create officer
    |--------------------------------------------------------------------------
    */

    if ($method === "POST") {

        $fullName = trim(
            $input["full_name"] ?? ""
        );

        $email = trim(
            $input["email"] ?? ""
        );

        $phone = trim(
            $input["phone"] ?? ""
        );

        $departmentId =
            !empty($input["department_id"])
                ? (int) $input["department_id"]
                : null;


        if ($fullName === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Officer full name is required."
            ]);

            exit;
        }


        /*
        | Check department
        */

        if ($departmentId !== null) {

            $stmt = $pdo->prepare(
                "SELECT id FROM departments WHERE id = ?"
            );

            $stmt->execute([
                $departmentId
            ]);

            if (!$stmt->fetch()) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Selected department does not exist."
                ]);

                exit;
            }
        }


        /*
        | Check duplicate email
        */

        if ($email !== "") {

            $stmt = $pdo->prepare(
                "SELECT id FROM officers WHERE email = ?"
            );

            $stmt->execute([
                $email
            ]);

            if ($stmt->fetch()) {

                http_response_code(409);

                echo json_encode([
                    "success" => false,
                    "message" => "An officer with this email already exists."
                ]);

                exit;
            }
        }


        $stmt = $pdo->prepare("
            INSERT INTO officers
                (
                    full_name,
                    email,
                    phone,
                    department_id
                )
            VALUES
                (?, ?, ?, ?)
        ");

        $stmt->execute([
            $fullName,
            $email !== "" ? $email : null,
            $phone !== "" ? $phone : null,
            $departmentId
        ]);


        echo json_encode([
            "success" => true,
            "message" => "Officer created successfully.",
            "id" => $pdo->lastInsertId()
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT - Update officer
    |--------------------------------------------------------------------------
    */

    if ($method === "PUT") {

        $id = (int) (
            $input["id"] ?? 0
        );

        $fullName = trim(
            $input["full_name"] ?? ""
        );

        $email = trim(
            $input["email"] ?? ""
        );

        $phone = trim(
            $input["phone"] ?? ""
        );

        $departmentId =
            !empty($input["department_id"])
                ? (int) $input["department_id"]
                : null;


        if ($id <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid officer ID."
            ]);

            exit;
        }


        if ($fullName === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Officer full name is required."
            ]);

            exit;
        }


        /*
        | Check officer exists
        */

        $stmt = $pdo->prepare(
            "SELECT id FROM officers WHERE id = ?"
        );

        $stmt->execute([
            $id
        ]);

        if (!$stmt->fetch()) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Officer not found."
            ]);

            exit;
        }


        /*
        | Check department
        */

        if ($departmentId !== null) {

            $stmt = $pdo->prepare(
                "SELECT id FROM departments WHERE id = ?"
            );

            $stmt->execute([
                $departmentId
            ]);

            if (!$stmt->fetch()) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Selected department does not exist."
                ]);

                exit;
            }
        }


        /*
        | Check duplicate email
        */

        if ($email !== "") {

            $stmt = $pdo->prepare(
                "
                SELECT id
                FROM officers
                WHERE email = ?
                AND id != ?
                "
            );

            $stmt->execute([
                $email,
                $id
            ]);

            if ($stmt->fetch()) {

                http_response_code(409);

                echo json_encode([
                    "success" => false,
                    "message" => "Another officer already uses this email."
                ]);

                exit;
            }
        }


        $stmt = $pdo->prepare("
            UPDATE officers
            SET
                full_name = ?,
                email = ?,
                phone = ?,
                department_id = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $fullName,
            $email !== "" ? $email : null,
            $phone !== "" ? $phone : null,
            $departmentId,
            $id
        ]);


        echo json_encode([
            "success" => true,
            "message" => "Officer updated successfully."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Delete officer
    |--------------------------------------------------------------------------
    */

    if ($method === "DELETE") {

        $id = (int) (
            $input["id"] ?? 0
        );


        if ($id <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid officer ID."
            ]);

            exit;
        }


        /*
        | Check assigned reports
        */

        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS total
            FROM reports
            WHERE assigned_officer_id = ?
        ");

        $stmt->execute([
            $id
        ]);

        $result = $stmt->fetch();

        $reportsCount =
            (int) ($result["total"] ?? 0);


        if ($reportsCount > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" =>
                    "This officer cannot be deleted because they are assigned to "
                    . $reportsCount
                    . " report(s). Reassign the reports first."
            ]);

            exit;
        }


        /*
        | Delete officer
        */

        $stmt = $pdo->prepare(
            "DELETE FROM officers WHERE id = ?"
        );

        $stmt->execute([
            $id
        ]);


        if ($stmt->rowCount() === 0) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Officer not found."
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "message" => "Officer deleted successfully."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported method
    |--------------------------------------------------------------------------
    */

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
