import json

# Polígonos de las 8 colonias piloto de Guadalajara
# Formato GeoJSON: [longitud, latitud]
# Centro de Guadalajara: ~[-103.3470, 20.6770]

colonias_features = [
    {
        "type": "Feature",
        "properties": {
            "id": "oblatos",
            "nombre": "Oblatos",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3200, 20.6850],
                [-103.2950, 20.6880],
                [-103.2900, 20.7020],
                [-103.3150, 20.7050],
                [-103.3250, 20.6930],
                [-103.3200, 20.6850]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "santa_cecilia",
            "nombre": "Santa Cecilia",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3100, 20.7080],
                [-103.2850, 20.7100],
                [-103.2800, 20.7250],
                [-103.3050, 20.7280],
                [-103.3150, 20.7180],
                [-103.3100, 20.7080]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "jardines_de_la_paz",
            "nombre": "Jardines de la Paz",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3150, 20.6480],
                [-103.2950, 20.6460],
                [-103.2900, 20.6620],
                [-103.3100, 20.6650],
                [-103.3200, 20.6550],
                [-103.3150, 20.6480]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "miravalle",
            "nombre": "Miravalle",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3550, 20.6100],
                [-103.3320, 20.6080],
                [-103.3300, 20.6250],
                [-103.3500, 20.6280],
                [-103.3600, 20.6180],
                [-103.3550, 20.6100]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "centro",
            "nombre": "Centro",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3580, 20.6700],
                [-103.3380, 20.6700],
                [-103.3360, 20.6860],
                [-103.3560, 20.6880],
                [-103.3600, 20.6780],
                [-103.3580, 20.6700]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "santa_teresita",
            "nombre": "Santa Teresita",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3750, 20.6800],
                [-103.3580, 20.6820],
                [-103.3600, 20.6950],
                [-103.3770, 20.6930],
                [-103.3750, 20.6800]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "chapalita",
            "nombre": "Chapalita",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.4080, 20.6580],
                [-103.3880, 20.6550],
                [-103.3850, 20.6720],
                [-103.4050, 20.6750],
                [-103.4120, 20.6650],
                [-103.4080, 20.6580]
            ]]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "id": "san_rafael",
            "nombre": "San Rafael",
            "municipio": "Guadalajara",
            "aproximado": True
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-103.3350, 20.6500],
                [-103.3180, 20.6480],
                [-103.3150, 20.6630],
                [-103.3320, 20.6650],
                [-103.3380, 20.6560],
                [-103.3350, 20.6500]
            ]]
        }
    }
]

geojson_data = {
    "type": "FeatureCollection",
    "features": colonias_features
}

with open("public/data/colonias.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, indent=2, ensure_ascii=False)

print("Archivo colonias.geojson generado correctamente con las 8 colonias de Guadalajara.")
