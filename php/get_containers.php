<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try {
    $pdo = chasqui_conectar();
    $stmt = $pdo->query("SELECT nombre, lat, lng, nivel FROM contenedores ORDER BY id ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo obtener contenedores', 'detalle' => $e->getMessage()]);
}
