
use("ISIS2304E01202610");

print("=== INICIO CARGA DATOS DE PRUEBA ===");

const colecciones = db.getCollectionNames();

if (!colecciones.includes("resenas_talarcon")) {
  db.createCollection("resenas_talarcon");
  print("✔ Colección resenas_talarcon creada.");
}

if (!colecciones.includes("votos_utilidad_talarcon")) {
  db.createCollection("votos_utilidad_talarcon");
  print("✔ Colección votos_utilidad_talarcon creada.");
}

function fecha(anio, mes, dia) {
  return new Date(
    `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T10:00:00Z`
  );
}

db.resenas_talarcon.deleteMany({
  id_cliente: { $gte: 1001, $lte: 9999 }
});

db.votos_utilidad_talarcon.deleteMany({
  id_usuario: { $gte: 2001, $lte: 9999 }
});

print("✔ Datos anteriores de prueba eliminados.");

const resenas = [];
let reservaId = 5001;
let clienteId = 1001;

function mkResena(
  id_hotel,
  id_cliente,
  id_reserva,
  calificacion,
  texto,
  anio,
  mes,
  dia,
  tieneRespuesta,
  destacada,
  votos
) {
  return {
    id_hotel,
    id_cliente,
    id_reserva,
    calificacion,
    texto,
    fecha_creacion: fecha(anio, mes, dia),
    fecha_edicion: null,
    estado: "publicada",
    destacada: destacada || false,
    votos_util: votos || 0,
    respuesta: tieneRespuesta
      ? {
          texto:
            "Gracias por sus comentarios. Seguimos trabajando para mejorar su experiencia.",
          fecha_respuesta: fecha(anio, mes, Math.min(dia + 2, 28)),
          id_admin: id_hotel * 10
        }
      : null
  };
}

const textos_buenos = [
  "Excelente atención del personal y habitaciones muy cómodas.",
  "Todo perfecto, volveré sin duda. El desayuno es espectacular.",
  "Ubicación inmejorable y servicio de primera categoría.",
  "Las instalaciones superaron mis expectativas. Muy recomendado.",
  "Personal muy amable y habitaciones impecables.",
  "Una experiencia única. El spa es increíble."
];

const textos_medios = [
  "Buena estadía en general, aunque el servicio puede mejorar.",
  "Habitaciones aceptables. La ubicación es conveniente.",
  "Relación calidad-precio razonable para el sector.",
  "El personal fue amable pero las instalaciones necesitan mantenimiento."
];

const textos_malos = [
  "La habitación estaba sucia al momento del check-in. Decepcionante.",
  "El servicio fue lento y el personal poco atento. No regresaría.",
  "Las instalaciones no corresponden con las fotos del sitio web.",
  "Problemas con el agua caliente durante toda la estadía."
];

function generarHotel(idHotel, calificaciones, textos, diaBase = 10) {
  for (let i = 0; i < calificaciones.length; i++) {
    resenas.push(
      mkResena(
        idHotel,
        clienteId++,
        reservaId++,
        calificaciones[i],
        textos[i % textos.length],
        2024,
        (i % 12) + 1,
        diaBase,
        i % 2 === 0,
        i === 0,
        Math.floor(Math.random() * 20)
      )
    );
  }

  print(`✔ Hotel ${idHotel} generado (${calificaciones.length} reseñas).`);
}

generarHotel(
  1,
  [5,4,5,5,4,5,5,4,5,5,4,4,5,5,4,5,5,4,5,5,4,5,5,4],
  textos_buenos
);

generarHotel(
  2,
  [4,3,4,4,3,4,4,3,4,4,4,3],
  textos_medios
);

generarHotel(
  3,
  [2,3,2,2,3,2,3,2,2,3],
  textos_malos
);

generarHotel(
  4,
  [4,4,5,4,3,4,4,5,4,4,4,3,4,4,5],
  textos_buenos
);

generarHotel(
  5,
  [5,5,5,4,5,5,5,5,4,5,5,5,5,4,5,5,5,5,4,5],
  textos_buenos
);

generarHotel(
  6,
  [3,4,3,3,4,3,4,3,3,4,3,3],
  textos_medios
);

generarHotel(
  7,
  [4,4,5,4,4,4,5,4],
  textos_buenos
);

generarHotel(
  8,
  [4,5,4,4,5,4,5,4,4,5,4,4,5,4],
  textos_buenos
);

generarHotel(
  9,
  [3,2,3,2,3,3,2,3,2,3],
  textos_malos
);

generarHotel(
  10,
  [5,4,5,5,4,5,5,4,5,5,5,4],
  textos_buenos
);

generarHotel(
  11,
  [5,5,5,5,4,5,5,5,5,5,5,4,5,5,5,5,5,4],
  textos_buenos
);

generarHotel(
  12,
  [4,4,5,4,4,5,4,4,4,5,4,4,4,5],
  textos_buenos
);

const resultado = db.resenas_talarcon.insertMany(resenas);

print(
  `\n✔ Total reseñas insertadas: ${
    Object.keys(resultado.insertedIds).length
  }`
);

const primerasResenas = db.resenas_talarcon
  .find({}, { _id: 1 })
  .limit(30)
  .toArray();

const votos = [];
let usuarioVotante = 2001;

primerasResenas.forEach((r, idx) => {
  const numVotos = (idx % 3) + 1;

  for (let v = 0; v < numVotos; v++) {
    votos.push({
      id_resena: r._id,
      id_usuario: usuarioVotante++,
      fecha_voto: fecha(
        2024,
        (idx % 12) + 1,
        Math.min((v + 1) * 5, 28)
      )
    });
  }
});

db.votos_utilidad_talarcon.insertMany(votos);

print(`✔ Total votos utilidad insertados: ${votos.length}`);

print("\n=== RESUMEN DE DATOS INSERTADOS ===");

print(
  "Reseñas totales: ",
  db.resenas_talarcon.countDocuments()
);

print(
  "Reseñas publicadas: ",
  db.resenas_talarcon.countDocuments({
    estado: "publicada"
  })
);

print(
  "Reseñas con respuesta: ",
  db.resenas_talarcon.countDocuments({
    respuesta: { $ne: null }
  })
);

print(
  "Reseñas destacadas: ",
  db.resenas_talarcon.countDocuments({
    destacada: true
  })
);

print(
  "Votos utilidad: ",
  db.votos_utilidad_talarcon.countDocuments()
);

print("\n=== HOTELES ===");

db.resenas_talarcon.aggregate([
  {
    $group: {
      _id: "$id_hotel",
      total: { $sum: 1 },
      promedio: { $avg: "$calificacion" }
    }
  },
  {
    $sort: {
      promedio: -1
    }
  }
]).forEach(h => {
  print(
    `Hotel ${h._id}: ${h.total} reseñas | promedio ${h.promedio.toFixed(2)}`
  );
});

print("\n=== FIN CARGA DATOS ===");