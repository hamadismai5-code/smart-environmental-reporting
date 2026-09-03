<?php

header("Content-Type: application/json");

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get form data
|--------------------------------------------------------------------------
*/

$problemType = trim($_POST["problem_type"] ?? "");
$description = trim($_POST["description"] ?? "");
$location    = trim($_POST["location"] ?? "");
$latitude    = $_POST["latitude"] ?? null;
$longitude   = $_POST["longitude"] ?? null;


/*
|--------------------------------------------------------------------------
| Validate required fields
|--------------------------------------------------------------------------
*/

if ($problemType === "" || $description === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Problem type and description are required"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Find category
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id FROM categories WHERE name = ? LIMIT 1"
);

$stmt->execute([$problemType]);

$category = $stmt->fetch();

if (!$category) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid problem type"
    ]);

    exit;
}

$categoryId = $category["id"];


/*
|--------------------------------------------------------------------------
| Generate Report ID
|--------------------------------------------------------------------------
*/

$reportId = "REP-" . date("Y") . "-" . strtoupper(
    substr(bin2hex(random_bytes(4)), 0, 6)
);


/*
|--------------------------------------------------------------------------
| Handle image upload
|--------------------------------------------------------------------------
*/

$imagePath = null;

if (isset($_FILES["photo"]) && $_FILES["photo"]["error"] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Photo upload failed"
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Maximum size: 5MB
    |--------------------------------------------------------------------------
    */

    if ($_FILES["photo"]["size"] > 5 * 1024 * 1024) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Photo must not exceed 5MB"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Validate MIME type
    |--------------------------------------------------------------------------
    */

    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png"  => "png",
        "image/webp" => "webp"
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);

    $mimeType = $finfo->file($_FILES["photo"]["tmp_name"]);

    if (!isset($allowedTypes[$mimeType])) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Only JPG, PNG and WEBP images are allowed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Create uploads directory
    |--------------------------------------------------------------------------
    */

    $uploadDirectory = "../uploads/";

    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0755, true);
    }


    /*
    |--------------------------------------------------------------------------
    | Create safe filename
    |--------------------------------------------------------------------------
    */

    $extension = $allowedTypes[$mimeType];

    $fileName = $reportId . "_" . bin2hex(random_bytes(5)) . "." . $extension;

    $destination = $uploadDirectory . $fileName;


    /*
    |--------------------------------------------------------------------------
    | Move uploaded file
    |--------------------------------------------------------------------------
    */

    if (!move_uploaded_file(
        $_FILES["photo"]["tmp_name"],
        $destination
    )) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to save uploaded photo"
        ]);

        exit;
    }

    $imagePath = "uploads/" . $fileName;
}


/*
|--------------------------------------------------------------------------
| Insert report into database
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        INSERT INTO reports (
            report_id,
            category_id,
            description,
            location,
            latitude,
            longitude,
            image_path,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Sent')
    ");

    $stmt->execute([
        $reportId,
        $categoryId,
        $description,
        $location,
        $latitude,
        $longitude,
        $imagePath
    ]);


    /*
    |--------------------------------------------------------------------------
    | Get inserted report
    |--------------------------------------------------------------------------
    */

    $insertedId = $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | Add first status update
    |--------------------------------------------------------------------------
    */

    $updateStmt = $pdo->prepare("
        INSERT INTO report_updates (
            report_id,
            status,
            comment
        )
        VALUES (?, 'Sent', 'Report submitted by citizen')
    ");

    $updateStmt->execute([
        $insertedId
    ]);


    /*
    |--------------------------------------------------------------------------
    | Success response
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Report submitted successfully",
        "report_id" => $reportId,
        "status" => "Sent"
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to submit report"
    ]);
}
