
use("dann_alpes_resenas");

db.createCollection("resenas");
print("✔ Colección 'resenas' creada.");

db.resenas.createIndex(
  { id_hotel: 1, estado: 1, fecha_creacion: -1 },
  { name: "idx_hotel_estado_fecha" }
);
db.resenas.createIndex(
  { id_cliente: 1, fecha_creacion: -1 },
  { name: "idx_cliente_fecha" }
);
db.resenas.createIndex(
  { id_reserva: 1 },
  { name: "idx_reserva_unico", unique: true, sparse: true }
);
db.resenas.createIndex(
  { id_hotel: 1, destacada: 1 },
  { name: "idx_hotel_destacada" }
);
db.resenas.createIndex(
  { id_hotel: 1, calificacion: 1, fecha_creacion: 1 },
  { name: "idx_hotel_cal_fecha" }
);
print("✔ Índices de 'resenas' creados.");

db.createCollection("votos_utilidad");
print("✔ Colección 'votos_utilidad' creada.");

db.votos_utilidad.createIndex(
  { id_resena: 1, id_usuario: 1 },
  { name: "idx_voto_unico", unique: true }
);
db.votos_utilidad.createIndex(
  { id_resena: 1 },
  { name: "idx_voto_por_resena" }
);
print("✔ Índices de 'votos_utilidad' creados.");

print("\n=== Colecciones en dann_alpes_resenas ===");
db.getCollectionNames().forEach(c => print("  •", c));
