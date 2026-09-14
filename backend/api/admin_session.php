<?php

require_once __DIR__ . "/../config/admin_auth.php";

header("Content-Type: application/json; charset=UTF-8");

if (empty($_SESSION["admin_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "authenticated" => false,
        "message" => "Not authenticated"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "authenticated" => true,
    "admin" => [
        "id" => $_SESSION["admin_id"],
        "name" => $_SESSION["admin_name"],
        "username" => $_SESSION["admin_username"],
        "role" => $_SESSION["admin_role"]
    ]
]);
