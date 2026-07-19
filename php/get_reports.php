<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

function tiempo_relativo(string $fechaIso): string {
    $segundos = time() - strtotime($fechaIso);
    if ($segundos < 60) return 'hace instantes';
    if ($segundos < 3600) return 'hace ' . floor($segundos / 60) . ' min';
    if ($segundos < 86400) return 'hace ' . floor($segundos / 3600) . 'h';
    return 'hace ' . floor($segundos / 86400) . 'd';
}

try {
    $pdo = chasqui_conectar();
    $stmt = $pdo->query("SELECT id, tipo, descripcion, creado_en, resuelto FROM reportes ORDER BY id DESC LIMIT 10");
    $reportes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $salida = array_map(function ($r) {
        return [
            'id' => (int) $r['id'],
            'tipo_corto' => mb_strimwidth($r['tipo'], 0, 14, '…'),
            'descripcion_corta' => $r['descripcion'] ?: $r['tipo'],
            'tiempo' => tiempo_relativo($r['creado_en']),
            'resuelto' => (bool) $r['resuelto']
        ];
    }, $reportes);

    echo json_encode($salida);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo obtener reportes', 'detalle' => $e->getMessage()]);
}
