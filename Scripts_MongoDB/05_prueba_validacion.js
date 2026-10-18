
use("ISIS2304E01202610");

print("=== ESCENARIO DE PRUEBA: Violaciones de esquema ===\n");

print("Prueba 1: calificacion = 7");
try {
  db.resenas_talarcon.insertOne({
    id_hotel: 1,
    id_cliente: 9001,
    id_reserva: 9901,
    calificacion: 7,
    texto: "Esta reseña tiene calificación inválida.",
    fecha_creacion: new Date(),
    estado: "publicada",
    destacada: false,
    votos_util: 0,
    respuesta: null
  });

  print("RESULTADO: Insertado (NO debería pasar)");

} catch (e) {

  print("✔ Error capturado correctamente");
}

print("\nPrueba 2: texto corto");

try {

  db.resenas_talarcon.insertOne({
    id_hotel: 1,
    id_cliente: 9002,
    id_reserva: 9902,
    calificacion: 4,
    texto: "Bueno",
    fecha_creacion: new Date(),
    estado: "publicada",
    destacada: false,
    votos_util: 0,
    respuesta: null
  });

  print("RESULTADO: Insertado (NO debería pasar)");

} catch (e) {

  print("✔ Error capturado correctamente");
}

print("\nPrueba 3: estado inválido");

try {

  db.resenas_talarcon.insertOne({
    id_hotel: 2,
    id_cliente: 9003,
    id_reserva: 9903,
    calificacion: 3,
    texto: "Una reseña con estado inválido para la prueba.",
    fecha_creacion: new Date(),
    estado: "borrada",
    destacada: false,
    votos_util: 0,
    respuesta: null
  });

  print("RESULTADO: Insertado (NO debería pasar)");

} catch (e) {

  print("✔ Error capturado correctamente");
}

print("\nPrueba 4: falta id_reserva");

try {

  db.resenas_talarcon.insertOne({
    id_hotel: 3,
    id_cliente: 9004,
    calificacion: 5,
    texto: "Reseña sin id_reserva.",
    fecha_creacion: new Date(),
    estado: "publicada",
    destacada: false,
    votos_util: 0,
    respuesta: null
  });

  print("RESULTADO: Insertado (NO debería pasar)");

} catch (e) {

  print("✔ Error capturado correctamente");
}

print("\nPrueba 5: respuesta incompleta");

try {

  db.resenas_talarcon.insertOne({
    id_hotel: 1,
    id_cliente: 9005,
    id_reserva: 9905,
    calificacion: 4,
    texto: "Respuesta sin id_admin.",
    fecha_creacion: new Date(),
    estado: "publicada",
    destacada: false,
    votos_util: 0,
    respuesta: {
      texto: "Gracias",
      fecha_respuesta: new Date()
    }
  });

  print("RESULTADO: Insertado (NO debería pasar)");

} catch (e) {

  print("✔ Error capturado correctamente");
}

print("\nPrueba 6: voto duplicado");

const resenaRef = db.resenas_talarcon.findOne({
  estado: "publicada"
});

if (resenaRef) {

  try {

    db.votos_utilidad_talarcon.insertOne({
      id_resena: resenaRef._id,
      id_usuario: 3001,
      fecha_voto: new Date()
    });

    print("Primer voto insertado");

  } catch (e) {

    print("Primer voto:", e.message);
  }

  try {

    db.votos_utilidad_talarcon.insertOne({
      id_resena: resenaRef._id,
      id_usuario: 3001,
      fecha_voto: new Date()
    });

    print("Segundo voto insertado (NO debería pasar)");

  } catch (e) {

    print("✔ Duplicado rechazado");
  }
}

print("\n=== Fin escenarios validación ===");