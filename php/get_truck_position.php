<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

try {
    $pdo = chasqui_conectar();
    $stmt = $pdo->query("SELECT id, nombre_ruta, placa, ruta_json FROM camiones ORDER BY id ASC");
    $camiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $salida = [];
    foreach ($camiones as $c) {
        $salida[] = [
            'id' => $c['id'],
            'nombre_ruta' => $c['nombre_ruta'],
            'placa' => $c['placa'],
            'ruta' => json_decode($c['ruta_json'])
        ];
    }
    echo json_encode($salida);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo obtener la ruta de los camiones', 'detalle' => $e->getMessage()]);
}
