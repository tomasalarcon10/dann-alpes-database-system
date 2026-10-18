
use("ISIS2304E01202610");

print("\n=======================================================");
print("RFC1 – Top 10 Hoteles por Calificación Promedio");
print("Período: 01/01/2024 – 31/12/2024");
print("=======================================================");

const resultadoRFC1 = db.resenas_talarcon.aggregate([
  {
    $match: {
      estado: "publicada",
      fecha_creacion: {
        $gte: new Date("2024-01-01T00:00:00Z"),
        $lte: new Date("2024-12-31T23:59:59Z")
      }
    }
  },
  {
    $group: {
      _id: "$id_hotel",
      calificacion_promedio: { $avg: "$calificacion" },
      total_resenas: { $sum: 1 },
      total_votos_util: { $sum: "$votos_util" }
    }
  },
  {
    $addFields: {
      calificacion_promedio: {
        $round: ["$calificacion_promedio", 2]
      }
    }
  },
  {
    $sort: {
      calificacion_promedio: -1,
      total_resenas: -1
    }
  },
  { $limit: 10 },
  {
    $project: {
      _id: 0,
      id_hotel: "$_id",
      calificacion_promedio: 1,
      total_resenas: 1,
      total_votos_util: 1
    }
  }
]).toArray();

print("\nRESULTADO RFC1:");
print(JSON.stringify(resultadoRFC1, null, 2));

const ID_HOTEL_RFC2 = 1;
const ANIO_RFC2 = 2024;

print("\n=======================================================");
print(`RFC2 – Evolución Mensual Reputación Hotel ${ID_HOTEL_RFC2} – ${ANIO_RFC2}`);
print("=======================================================");

const resultadoRFC2 = db.resenas_talarcon.aggregate([
  {
    $match: {
      id_hotel: ID_HOTEL_RFC2,
      estado: "publicada",
      fecha_creacion: {
        $gte: new Date(`${ANIO_RFC2}-01-01T00:00:00Z`),
        $lte: new Date(`${ANIO_RFC2}-12-31T23:59:59Z`)
      }
    }
  },
  {
    $group: {
      _id: {
        anio_mes: {
          $dateToString: {
            format: "%Y-%m",
            date: "$fecha_creacion"
          }
        }
      },
      calificacion_promedio_mes: {
        $avg: "$calificacion"
      },
      total_resenas_mes: {
        $sum: 1
      }
    }
  },
  {
    $addFields: {
      calificacion_promedio_mes: {
        $round: ["$calificacion_promedio_mes", 2]
      }
    }
  },
  {
    $sort: {
      "_id.anio_mes": 1
    }
  },
  {
    $project: {
      _id: 0,
      mes: "$_id.anio_mes",
      calificacion_promedio: "$calificacion_promedio_mes",
      total_resenas: "$total_resenas_mes"
    }
  }
]).toArray();

print("\nRESULTADO RFC2:");
print(JSON.stringify(resultadoRFC2, null, 2));

const mapaHotelCiudad = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 2,
  8: 3,
  9: 3,
  10: 3,
  11: 4,
  12: 4
};

Object.entries(mapaHotelCiudad).forEach(([hotel, ciudad]) => {
  db.resenas_talarcon.updateMany(
    {
      id_hotel: parseInt(hotel),
      id_ciudad_hotel: { $exists: false }
    },
    {
      $set: {
        id_ciudad_hotel: ciudad
      }
    }
  );
});

const ID_CIUDAD_RFC3 = 1;

print("\n=======================================================");
print(`RFC3 – Perfil Comparativo Hoteles Ciudad ${ID_CIUDAD_RFC3} (Bogotá)`);
print("=======================================================");

const resultadoRFC3 = db.resenas_talarcon.aggregate([
  {
    $match: {
      id_ciudad_hotel: ID_CIUDAD_RFC3,
      estado: "publicada"
    }
  },
  {
    $group: {
      _id: "$id_hotel",
      total_resenas: { $sum: 1 },
      calificacion_promedio: {
        $avg: "$calificacion"
      },
      resenas_con_respuesta: {
        $sum: {
          $cond: [
            { $ne: ["$respuesta", null] },
            1,
            0
          ]
        }
      },
      resenas_destacadas: {
        $sum: {
          $cond: ["$destacada", 1, 0]
        }
      }
    }
  },
  {
    $addFields: {
      calificacion_promedio: {
        $round: ["$calificacion_promedio", 2]
      },
      pct_con_respuesta: {
        $round: [
          {
            $multiply: [
              {
                $divide: [
                  "$resenas_con_respuesta",
                  "$total_resenas"
                ]
              },
              100
            ]
          },
          1
        ]
      },
      pct_destacadas: {
        $round: [
          {
            $multiply: [
              {
                $divide: [
                  "$resenas_destacadas",
                  "$total_resenas"
                ]
              },
              100
            ]
          },
          1
        ]
      }
    }
  },
  {
    $facet: {
      hoteles: [
        {
          $sort: {
            calificacion_promedio: -1
          }
        },
        {
          $project: {
            _id: 0,
            id_hotel: "$_id",
            calificacion_promedio: 1,
            total_resenas: 1,
            pct_con_respuesta: 1,
            pct_destacadas: 1
          }
        }
      ],
      promedio_ciudad: [
        {
          $group: {
            _id: null,
            valor: {
              $avg: "$calificacion_promedio"
            }
          }
        }
      ]
    }
  },
  {
    $addFields: {
      promedio_ciudad: {
        $round: [
          {
            $arrayElemAt: [
              "$promedio_ciudad.valor",
              0
            ]
          },
          2
        ]
      }
    }
  },
  {
    $addFields: {
      hoteles: {
        $map: {
          input: "$hoteles",
          as: "h",
          in: {
            id_hotel: "$$h.id_hotel",
            calificacion_promedio: "$$h.calificacion_promedio",
            total_resenas: "$$h.total_resenas",
            pct_con_respuesta: "$$h.pct_con_respuesta",
            pct_destacadas: "$$h.pct_destacadas",
            bajo_promedio_ciudad: {
              $lt: [
                "$$h.calificacion_promedio",
                "$promedio_ciudad"
              ]
            }
          }
        }
      }
    }
  },
  {
    $project: {
      _id: 0
    }
  }
]).toArray();

print("\nRESULTADO RFC3:");
print(JSON.stringify(resultadoRFC3, null, 2));

print("\n=== Punto 4: Diseño de Sentencias MongoDB – Completado ===");