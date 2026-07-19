<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido, usa POST']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos || empty($datos['tipo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el campo "tipo" en el reporte']);
    exit;
}

// Whitelist de tipos válidos (deben coincidir con las opciones del formulario)
$tiposValidos = [
    'Contenedor lleno / rebalsando',
    'Microbasural clandestino',
    'Fuga de lixiviados',
    'Camión no pasó',
    'Otro'
];

$tipo = trim($datos['tipo']);
if (!in_array($tipo, $tiposValidos, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de reporte no válido']);
    exit;
}

// Límites de longitud para evitar abuso / datos basura
$nombre = mb_substr(trim($datos['nombre'] ?? 'Anónimo'), 0, 60);
$descripcion = mb_substr(trim($datos['descripcion'] ?? ''), 0, 500);
$lat = isset($datos['lat']) ? (float) $datos['lat'] : null;
$lng = isset($datos['lng']) ? (float) $datos['lng'] : null;

// Coordenadas fuera de rango válido: se descartan en vez de guardarse
if ($lat !== null && ($lat < -90 || $lat > 90)) $lat = null;
if ($lng !== null && ($lng < -180 || $lng > 180)) $lng = null;

if ($nombre === '') $nombre = 'Anónimo';

try {
    $pdo = chasqui_conectar();
    $stmt = $pdo->prepare("
        INSERT INTO reportes (tipo, nombre, descripcion, lat, lng, creado_en)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $tipo,
        $nombre,
        $descripcion,
        $lat,
        $lng,
        date('c')
    ]);

    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el reporte', 'detalle' => $e->getMessage()]);
}
