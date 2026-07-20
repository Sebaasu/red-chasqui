#!/usr/bin/env python3
import http.server
import socketserver
import os
import json
import sqlite3
import urllib.parse
import datetime

PORT = 8000
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "chasqui.sqlite"))

def init_db():
    # Asegurar que el directorio de datos existe
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Crear tablas
    cursor.execute("""
        DROP TABLE IF EXISTS contenedores;
    """)
    cursor.execute("""
        DROP TABLE IF EXISTS camiones;
    """)
    cursor.execute("""
        CREATE TABLE contenedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            nivel INTEGER NOT NULL,
            tipo TEXT NOT NULL DEFAULT 'general'
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            nombre TEXT,
            descripcion TEXT,
            lat REAL,
            lng REAL,
            creado_en TEXT NOT NULL,
            resuelto INTEGER NOT NULL DEFAULT 0
        );
    """)
    cursor.execute("""
        CREATE TABLE camiones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_ruta TEXT NOT NULL,
            placa TEXT,
            ruta_json TEXT NOT NULL
        );
    """)
    
    # Cargar contenedores desde coordenadas/contenedores.txt del repositorio
    base_dir = os.path.dirname(os.path.abspath(__file__))
    cont_path = os.path.join(base_dir, "coordenadas", "contenedores.txt")
    contenedores_lista = []
    
    if os.path.exists(cont_path):
        try:
            with open(cont_path, 'r') as f:
                contenedores_lista = json.loads(f.read().strip())
        except Exception as e:
            print("Error al cargar contenedores.txt:", e)
            
    if not contenedores_lista:
        # Fallback si no existe o está vacío
        contenedores_lista = [
            [-16.497904,-68.137014],[-16.496814,-68.137658],[-16.496279,-68.136628],[-16.495189,-68.136692]
        ]
        
    # Distribución determinista de niveles de llenado (44 niveles para dar dinamismo de colores)
    niveles = [35, 82, 15, 91, 55, 12, 78, 92, 45, 10, 88, 62, 23, 79, 90, 14, 52, 83, 71, 39, 81, 16, 
               49, 93, 27, 72, 85, 59, 11, 86, 33, 94, 68, 20, 80, 42, 13, 89, 56, 31, 75, 95, 47, 18]
               
    print(f"Sembrando {len(contenedores_lista)} contenedores desde coordenadas...")
    
    for i, c in enumerate(contenedores_lista):
        nombre = f"C-{i+1:02d}"
        nivel = niveles[i % len(niveles)]
        tipo = 'general'
        if i % 4 == 1:
            tipo = 'plastico'
        elif i % 4 == 2:
            tipo = 'papel'
        elif i % 4 == 3:
            tipo = 'isla_verde'
        cursor.execute("INSERT INTO contenedores (nombre, lat, lng, nivel, tipo) VALUES (?, ?, ?, ?, ?)",
                       (nombre, c[0], c[1], nivel, tipo))
                       
    # Cargar las tres rutas dibujadas manualmente por el usuario del repositorio
    r1_path = os.path.join(base_dir, "coordenadas", "ruta1.txt")
    r2_path = os.path.join(base_dir, "coordenadas", "ruta2.txt")
    r3_path = os.path.join(base_dir, "coordenadas", "ruta3.txt")
    
    ruta1_json = None
    ruta2_json = None
    ruta3_json = None
    
    if os.path.exists(r1_path):
        with open(r1_path, 'r') as f:
            ruta1_json = f.read().strip()
    if os.path.exists(r2_path):
        with open(r2_path, 'r') as f:
            ruta2_json = f.read().strip()
    if os.path.exists(r3_path):
        with open(r3_path, 'r') as f:
            ruta3_json = f.read().strip()
            
    # Fallbacks por si acaso
    if not ruta1_json:
        ruta1_json = json.dumps([[-16.498854,-68.14034],[-16.497579,-68.138709]])
    if not ruta2_json:
        ruta2_json = json.dumps([[-16.497211,-68.136145],[-16.496697,-68.13578]])
    if not ruta3_json:
        ruta3_json = json.dumps([[-16.50251,-68.137132],[-16.503086,-68.136499]])
        
    cursor.execute("INSERT INTO camiones (nombre_ruta, placa, ruta_json) VALUES (?, ?, ?)",
                   ('Ruta Centro-Sopocachi (Real 1)', '4821-LPD', ruta1_json))
    cursor.execute("INSERT INTO camiones (nombre_ruta, placa, ruta_json) VALUES (?, ?, ?)",
                   ('Ruta San Pedro-Miraflores (Real 2)', '5078-DFA', ruta2_json))
    cursor.execute("INSERT INTO camiones (nombre_ruta, placa, ruta_json) VALUES (?, ?, ?)",
                   ('Ruta Sopocachi Auxiliar (Real 3)', '3192-KPT', ruta3_json))
                   
    # Sembrar reportes vecinales iniciales sobre el mapa si la tabla está vacía
    cursor.execute("SELECT COUNT(*) FROM reportes")
    if cursor.fetchone()[0] == 0:
        t_10m = (datetime.datetime.now() - datetime.timedelta(minutes=10)).isoformat()
        t_45m = (datetime.datetime.now() - datetime.timedelta(minutes=45)).isoformat()
        t_2h = (datetime.datetime.now() - datetime.timedelta(hours=2)).isoformat()
        
        cursor.execute("INSERT INTO reportes (tipo, nombre, descripcion, lat, lng, creado_en) VALUES (?, ?, ?, ?, ?, ?)",
                       ('Contenedor lleno / rebalsando', 'Vecino', 'Contenedor C-02 lleno', -16.4968, -68.1376, t_10m))
        cursor.execute("INSERT INTO reportes (tipo, nombre, descripcion, lat, lng, creado_en) VALUES (?, ?, ?, ?, ?, ?)",
                       ('Microbasural clandestino', 'Vecino', 'Basura acumulada en la esquina', -16.4928, -68.1371, t_45m))
        
    conn.commit()
    conn.close()

class ChasquiHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Desactivar caché para desarrollo
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        # Endpoints de API PHP emulados
        if path == "/php/get_containers.php":
            self.get_containers()
        elif path == "/php/get_truck_position.php":
            self.get_truck_position()
        elif path == "/php/get_reports.php":
            self.get_reports()
        else:
            # Comportamiento estático por defecto
            if path == "/" or path == "":
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if path == "/php/submit_report.php":
            self.submit_report()
        elif path == "/php/resolve_report.php":
            self.resolve_report()
        else:
            self.send_response(404)
            self.end_headers()

    def get_containers(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre, lat, lng, nivel, tipo FROM contenedores")
            rows = cursor.fetchall()
            conn.close()

            containers = []
            for r in rows:
                containers.append({
                    "id": r[0],
                    "nombre": r[1],
                    "lat": r[2],
                    "lng": r[3],
                    "nivel": r[4],
                    "tipo": r[5]
                })
            self.wfile.write(json.dumps(containers).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def get_truck_position(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre_ruta, placa, ruta_json FROM camiones ORDER BY id ASC")
            rows = cursor.fetchall()
            conn.close()

            trucks = []
            for r in rows:
                trucks.append({
                    "id": r[0],
                    "nombre_ruta": r[1],
                    "placa": r[2],
                    "ruta": json.loads(r[3])
                })
            self.wfile.write(json.dumps(trucks).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def get_reports(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT id, tipo, nombre, descripcion, lat, lng, creado_en FROM reportes WHERE resuelto = 0 ORDER BY id DESC")
            rows = cursor.fetchall()
            conn.close()

            reports = []
            for r in rows:
                reports.append({
                    "id": r[0],
                    "tipo": r[1],
                    "nombre": r[2],
                    "descripcion": r[3],
                    "lat": r[4],
                    "lng": r[5],
                    "creado_en": r[6]
                })
            self.wfile.write(json.dumps(reports).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def submit_report(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        params = {}
        try:
            params = json.loads(post_data)
        except json.JSONDecodeError:
            params = urllib.parse.parse_qs(post_data)
            for k, v in params.items():
                if isinstance(v, list) and len(v) > 0:
                    params[k] = v[0]

        tipo = params.get('tipo', 'Otros')
        nombre = params.get('nombre', 'Ciudadano')
        descripcion = params.get('descripcion', '')
        lat = float(params.get('lat', 0))
        lng = float(params.get('lng', 0))
        
        creado_en = datetime.datetime.now().isoformat()

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO reportes (tipo, nombre, descripcion, lat, lng, creado_en) VALUES (?, ?, ?, ?, ?, ?)",
                (tipo, nombre, descripcion, lat, lng, creado_en)
            )
            conn.commit()
            report_id = cursor.lastrowid
            conn.close()

            self.wfile.write(json.dumps({"success": True, "id": report_id}).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))

    def resolve_report(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        params = {}
        try:
            params = json.loads(post_data)
        except json.JSONDecodeError:
            params = urllib.parse.parse_qs(post_data)
            for k, v in params.items():
                if isinstance(v, list) and len(v) > 0:
                    params[k] = v[0]

        report_id = params.get('id')

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        if not report_id:
            self.wfile.write(json.dumps({"success": False, "error": "Falta ID de reporte"}).encode('utf-8'))
            return

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("UPDATE reportes SET resuelto = 1 WHERE id = ?", (report_id,))
            conn.commit()
            conn.close()

            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))

if __name__ == "__main__":
    init_db()
    print("==================================================")
    print("   RED CHASQUI · SERVIDOR DE DESARROLLO PYTHON")
    print("==================================================")
    print(f" Servidor corriendo en: http://localhost:{PORT}")
    print(" Presiona Ctrl+C para detener.")
    print("==================================================")
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ChasquiHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nDeteniendo servidor...")
