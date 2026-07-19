import re
import json
import os
import math

def distancia_metros(lat1, lng1, lat2, lng2):
    R = 6371e3  # Radio de la Tierra en metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = (math.sin(delta_phi / 2.0) ** 2 + 
         math.cos(phi1) * math.cos(phi2) * 
         math.sin(delta_lambda / 2.0) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def remove_spikes(route):
    if len(route) < 3:
        return route
        
    cleaned = [route[0]]
    
    for i in range(1, len(route) - 1):
        prev = route[i-1]
        curr = route[i]
        nxt = route[i+1]
        
        # Calcular distancias
        d1 = distancia_metros(prev[0], prev[1], curr[0], curr[1])
        d2 = distancia_metros(curr[0], curr[1], nxt[0], nxt[1])
        d_direct = distancia_metros(prev[0], prev[1], nxt[0], nxt[1])
        
        # Filtro de picos: si salta bruscamente (> 150m) y luego regresa (> 150m),
        # pero la distancia directa entre anterior y siguiente es pequeña (< 100m)
        if d1 > 150 and d2 > 150 and d_direct < 100:
            print(f"  [FILTRADO] Pico corrupto detectado en {curr}: salto de {d1:.1f}m y regreso de {d2:.1f}m")
            continue
            
        cleaned.append(curr)
        
    cleaned.append(route[-1])
    return cleaned

def clean_gps_file(file_path):
    route_points = []
    
    # Expresiones regulares para soportar ambos formatos de logs (el antiguo y el nuevo v2)
    pattern_old = re.compile(r"Paquete recibido: '(.*?)'")
    pattern_new = re.compile(r"\$(ID:.*?)\$")
    
    if not os.path.exists(file_path):
        print(f"Error: El archivo {file_path} no existe.")
        return []

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        for line_num, line in enumerate(f, 1):
            match_new = pattern_new.search(line)
            match_old = pattern_old.search(line)
            
            if match_new:
                payload = match_new.group(1)
            elif match_old:
                payload = match_old.group(1)
            else:
                continue
            
            # Buscar campos usando expresiones regulares robustas para manejar corrupción parcial
            lat_match = re.search(r"Lat:(-?\d+\.\d+)", payload)
            lng_match = re.search(r"Lng:(-?\d+\.\d+)", payload)
            
            if not lat_match or not lng_match:
                continue
                
            try:
                lat = float(lat_match.group(1))
                lng = float(lng_match.group(1))
                
                # Filtrar puntos 0.0 (cuando el GPS no tiene FIX satelital)
                if lat == 0.0 or lng == 0.0:
                    continue
                    
                # Bounding box aproximado para el municipio de La Paz, Bolivia
                if not (-16.7 < lat < -16.3 and -68.3 < lng < -68.0):
                    continue
                
                # Evitar duplicados consecutivos exactos
                if route_points and route_points[-1] == [lat, lng]:
                    continue
                    
                route_points.append([lat, lng])
                
            except ValueError:
                continue
                
    # Aplicar filtro de eliminación de picos
    print(f"Aplicando filtro de picos a {file_path}...")
    filtered_points = remove_spikes(route_points)
    
    return filtered_points

def main():
    data_dir = "/home/gabriel/hackaton2026/data"
    
    # Se eliminó la ruta 2 corta por solicitud del usuario
    file_ruta1 = os.path.join(data_dir, "serial_20260716_182638.txt")
    file_ruta3 = os.path.join(data_dir, "serial_20260718_190555.txt")
    
    pts_ruta1 = clean_gps_file(file_ruta1)
    pts_ruta3 = clean_gps_file(file_ruta3)
    
    print(f"Ruta 1 limpia (con filtros): {len(pts_ruta1)} puntos válidos extraídos de {file_ruta1}")
    print(f"Ruta 3 limpia (con filtros): {len(pts_ruta3)} puntos válidos extraídos de {file_ruta3}")
    
    # Guardar a archivos JSON para consumo del backend
    with open(os.path.join(data_dir, "ruta1_limpia.json"), "w") as f:
        json.dump(pts_ruta1, f)
        
    with open(os.path.join(data_dir, "ruta3_limpia.json"), "w") as f:
        json.dump(pts_ruta3, f)
        
    # Eliminar el archivo temporal ruta2_limpia.json si existe para evitar residuos
    file_ruta2_json = os.path.join(data_dir, "ruta2_limpia.json")
    if os.path.exists(file_ruta2_json):
        os.remove(file_ruta2_json)
        
    print("Rutas limpias guardadas como archivos JSON en la carpeta data. Ruta 2 eliminada.")

if __name__ == "__main__":
    main()
