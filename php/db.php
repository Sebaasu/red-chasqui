<?php
// Conexión a SQLite (no requiere instalar MySQL: crea el archivo automáticamente)
// En producción, reemplaza esto por una conexión a MySQL/PostgreSQL institucional.

function chasqui_conectar(): PDO {
    $rutaBD = __DIR__ . '/../data/chasqui.sqlite';
    $nuevo = !file_exists($rutaBD);

    $pdo = new PDO('sqlite:' . $rutaBD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($nuevo) {
        chasqui_crear_esquema($pdo);
        chasqui_sembrar_datos($pdo);
    }

    return $pdo;
}

function chasqui_crear_esquema(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE contenedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            nivel INTEGER NOT NULL
        );
    ");

    $pdo->exec("
        CREATE TABLE reportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            nombre TEXT,
            descripcion TEXT,
            lat REAL,
            lng REAL,
            creado_en TEXT NOT NULL,
            resuelto INTEGER NOT NULL DEFAULT 0
        );
    ");

    $pdo->exec("
        CREATE TABLE camiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_ruta TEXT NOT NULL,
            placa TEXT,
            ruta_json TEXT NOT NULL
        );
    ");
}

function chasqui_sembrar_datos(PDO $pdo): void {
    $pdo->exec("
        INSERT INTO contenedores (nombre, lat, lng, nivel) VALUES
        ('C-10 (Plaza España)', -16.5115, -68.1285, 35),
        ('C-11 (Plaza Abaroa)', -16.5106, -68.1256, 82),
        ('C-12 (El Prado - Alameda)', -16.5015, -68.1325, 15),
        ('C-13 (Plaza Isabel La Católica)', -16.5085, -68.1235, 91),
        ('C-14 (Mirador Killi Killi)', -16.4957, -68.1305, 55);
    ");

    // Cargar rutas reales limpiadas
    $ruta1_json = @file_get_contents(__DIR__ . '/../../data/ruta1_limpia.json');
    $ruta2_json = @file_get_contents(__DIR__ . '/../../data/ruta3_limpia.json'); // Usamos ruta3 como el segundo camión

    // Fallbacks si los archivos no existen
    if (!$ruta1_json) {
        $ruta1_json = json_encode([[-16.501074, -68.132133], [-16.500929, -68.132126], [-16.5007, -68.132294]]);
    }
    if (!$ruta2_json) {
        $ruta2_json = json_encode([[-16.484737, -68.121788], [-16.48468, -68.12178], [-16.484352, -68.12149]]);
    }

    $stmt = $pdo->prepare("INSERT INTO camiones (nombre_ruta, placa, ruta_json) VALUES (?, ?, ?)");
    $stmt->execute(['Ruta Centro-Sopocachi (Real 1)', '4821-LPD', $ruta1_json]);
    $stmt->execute(['Ruta San Pedro-Miraflores (Real 2)', '5078-DFA', $ruta2_json]);

    $stmt = $pdo->prepare("INSERT INTO reportes (tipo, nombre, descripcion, lat, lng, creado_en) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Contenedor lleno / rebalsando', 'Vecino', 'Contenedor C-11 lleno', -16.5106, -68.1256, date('c', strtotime('-10 minutes'))]);
    $stmt->execute(['Microbasural clandestino', 'Vecino', 'Basural en El Prado', -16.5015, -68.1325, date('c', strtotime('-45 minutes'))]);
    $stmt->execute(['Camión no pasó', 'Vecino', 'Camión demorado en Plaza España', -16.5115, -68.1285, date('c', strtotime('-2 hours'))]);
}
