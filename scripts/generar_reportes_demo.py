import json
import random

# Semilla fija para reproducibilidad determinista
random.seed(42)

# Regla fija y transparente (no ajustada para obtener colores concretos):
# reportes de calidad = redondeo(incidencia x viviendas / 1000), con las VIVIENDAS REALES
# del Dataset 01 (INEGI, Censo 2020) de public/data/viviendas.json.
# La incidencia (reportes por 1,000 viviendas) es un supuesto de la demostración, no un dato real.
with open("public/data/viviendas.json", encoding="utf-8") as fv:
    viviendas = json.load(fv)

INCIDENCIA_CALIDAD = {
    "oblatos": 4.1, "santa_cecilia": 3.8, "jardines_de_la_paz": 2.4, "miravalle": 2.1,
    "centro": 0.9, "santa_teresita": 0.7, "chapalita": 0.5, "san_rafael": 0.0,
}
INCIDENCIA_FALTA_AGUA = {
    "oblatos": 0.65, "santa_cecilia": 0.52, "miravalle": 0.45, "jardines_de_la_paz": 0.30,
    "centro": 0.0, "santa_teresita": 0.0, "chapalita": 0.0, "san_rafael": 0.0,
}

def conteo(incidencia, colonia):
    return round(incidencia * viviendas[colonia]["viviendas"] / 1000)

colonias_calidad = {c: conteo(i, c) for c, i in INCIDENCIA_CALIDAD.items()}
colonias_falta_agua = {c: conteo(i, c) for c, i in INCIDENCIA_FALTA_AGUA.items()}

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
