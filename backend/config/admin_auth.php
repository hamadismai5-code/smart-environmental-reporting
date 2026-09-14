<?php

require_once __DIR__ . "/cors.php";

if (session_status() === PHP_SESSION_NONE) {

    session_set_cookie_params([
        "httponly" => true,
        "samesite" => "Lax",
        "secure" => false
    ]);

    session_start();
}

function require_admin()
{
    if (empty($_SESSION["admin_id"])) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Unauthorized. Admin login required."
        ]);

        exit;
    }
}

function get_admin_id()
{
    return $_SESSION["admin_id"] ?? null;
}
