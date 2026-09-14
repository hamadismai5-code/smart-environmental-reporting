<?php

require_once __DIR__ . "/../config/admin_auth.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed"
    ]);

    exit;
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Username and password are required"
    ]);

    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            full_name,
            username,
            password_hash,
            role
        FROM admins
        WHERE username = ?
        LIMIT 1
    ");

    $stmt->execute([$username]);

    $admin = $stmt->fetch();

    if (!$admin || !password_verify(
        $password,
        $admin["password_hash"]
    )) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);

        exit;
    }

    session_regenerate_id(true);

    $_SESSION["admin_id"] = $admin["id"];
    $_SESSION["admin_name"] = $admin["full_name"];
    $_SESSION["admin_username"] = $admin["username"];
    $_SESSION["admin_role"] = $admin["role"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "admin" => [
            "id" => $admin["id"],
            "name" => $admin["full_name"],
            "username" => $admin["username"],
            "role" => $admin["role"]
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Login failed"
    ]);

    exit;
}
