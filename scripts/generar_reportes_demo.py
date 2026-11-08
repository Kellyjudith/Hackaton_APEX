import json
import random

# Semilla fija para reproducibilidad determinista
random.seed(42)

# 109 reportes de calidad según distribución exacta de CONTEXTO / CORRECCION
colonias_calidad = {
    "oblatos": 38,
    "santa_cecilia": 29,
    "jardines_de_la_paz": 16,
    "miravalle": 14,
    "centro": 5,
    "santa_teresita": 4,
    "chapalita": 3,
    "san_rafael": 0
}

# Avisos independientes de falta de agua (fuera del semáforo de calidad)
colonias_falta_agua = {
    "oblatos": 6,
    "santa_cecilia": 4,
    "miravalle": 3,
    "jardines_de_la_paz": 2,
    "centro": 0,
    "santa_teresita": 0,
    "chapalita": 0,
    "san_rafael": 0
}

tipos_calidad = ["turbia", "olor", "color"]
tipo_pesos = [0.55, 0.30, 0.15]

reportes = []
report_id = 1

# 1. Generar los 109 reportes de calidad
for colonia, count in colonias_calidad.items():
    for _ in range(count):
        tipo = random.choices(tipos_calidad, weights=tipo_pesos)[0]
        if colonia in ["oblatos", "santa_cecilia"]:
            dias_atras = int(random.triangular(0, 29, 5))
        else:
            dias_atras = random.randint(0, 29)
        
        r_sintomas = random.random()
        if r_sintomas < 0.30:
            sintomas = True
        elif r_sintomas < 0.75:
            sintomas = False
        else:
            sintomas = None

        reportes.append({
            "id": f"demo-{report_id:03d}",
            "colonia": colonia,
            "tipo": tipo,
            "sintomas": sintomas,
            "diasAtras": dias_atras,
            "simulado": True
        })
        report_id += 1

# 2. Generar los avisos de falta de agua independientes
for colonia, count in colonias_falta_agua.items():
    for _ in range(count):
        dias_atras = random.randint(0, 29)
        reportes.append({
            "id": f"demo-fa-{report_id:03d}",
            "colonia": colonia,
            "tipo": "falta_agua",
            "sintomas": None,
            "diasAtras": dias_atras,
            "simulado": True
        })
        report_id += 1

with open("public/data/reportes_demo.json", "w", encoding="utf-8") as f:
    json.dump(reportes, f, indent=2, ensure_ascii=False)

calidad_count = sum(1 for r in reportes if r["tipo"] in tipos_calidad)
falta_count = sum(1 for r in reportes if r["tipo"] == "falta_agua")
print(f"Total reportes: {len(reportes)} ({calidad_count} de calidad, {falta_count} de falta de agua)")
