import json
import random

# Semilla fija para reproducibilidad determinista
random.seed(42)

colonias_counts = {
    "oblatos": 38,
    "santa_cecilia": 29,
    "jardines_de_la_paz": 16,
    "miravalle": 14,
    "centro": 5,
    "santa_teresita": 4,
    "chapalita": 3,
    "san_rafael": 0
}

tipos_calidad = ["turbia", "olor", "color"]
tipo_pesos = [0.55, 0.30, 0.15] # 55% turbia, 30% olor, 15% color

reportes = []
report_id = 1

for colonia, count in colonias_counts.items():
    for i in range(count):
        tipo = random.choices(tipos_calidad, weights=tipo_pesos)[0]
        # diasAtras entre 0 y 29 (dentro de los últimos 30 días)
        # para Oblatos y Santa Cecilia concentramos algunos más recientes para reflejar tendencia al alza
        if colonia in ["oblatos", "santa_cecilia"]:
            dias_atras = int(random.triangular(0, 29, 5))
        else:
            dias_atras = random.randint(0, 29)
        
        # sintomas: true, false, null
        # En Oblatos aprox 35% de síntomas
        r_sintomas = random.random()
        if r_sintomas < 0.30:
            sintomas = True
        elif r_sintomas < 0.75:
            sintomas = False
        else:
            sintomas = None # prefiero no decir

        reportes.append({
            "id": f"demo-{report_id:03d}",
            "colonia": colonia,
            "tipo": tipo,
            "sintomas": sintomas,
            "diasAtras": dias_atras,
            "simulado": True
        })
        report_id += 1

# Guardar en public/data/reportes_demo.json
with open("public/data/reportes_demo.json", "w", encoding="utf-8") as f:
    json.dump(reportes, f, indent=2, ensure_ascii=False)

print(f"Generados {len(reportes)} reportes demo exitosamente.")
