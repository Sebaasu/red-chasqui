<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido, usa POST']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$id = isset($datos['id']) ? (int) $datos['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta un "id" de reporte válido']);
    exit;
}

try {
    $pdo = chasqui_conectar();
    $stmt = $pdo->prepare("UPDATE reportes SET resuelto = 1 WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Reporte no encontrado']);
        exit;
    }

    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar el reporte', 'detalle' => $e->getMessage()]);
}
