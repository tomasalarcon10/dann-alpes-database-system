
use("dann_alpes_resenas");

db.runCommand({
  collMod: "resenas",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de validación – Reseña",
      required: [
        "id_hotel",
        "id_cliente",
        "id_reserva",
        "calificacion",
        "texto",
        "fecha_creacion",
        "estado"
      ],
      properties: {
        id_hotel: {
          bsonType: "int",
          minimum: 1,
          description: "ID del hotel en Oracle. Obligatorio, entero positivo."
        },
        id_cliente: {
          bsonType: "int",
          minimum: 1,
          description: "ID del cliente en Oracle. Obligatorio, entero positivo."
        },
        id_reserva: {
          bsonType: "int",
          minimum: 1,
          description: "ID de la reserva en Oracle. Obligatorio. Debe ser única (ver índice)."
        },
        calificacion: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Calificación del 1 al 5. Obligatoria."
        },
        texto: {
          bsonType: "string",
          minLength: 10,
          maxLength: 2000,
          description: "Texto de la reseña. Obligatorio, entre 10 y 2000 caracteres."
        },
        fecha_creacion: {
          bsonType: "date",
          description: "Fecha y hora de creación. Obligatoria."
        },
        fecha_edicion: {
          bsonType: ["date", "null"],
          description: "Fecha de la última edición. Null si nunca fue editada."
        },
        estado: {
          bsonType: "string",
          enum: ["publicada", "eliminada_cliente", "eliminada_admin"],
          description: "Estado de la reseña. Solo valores permitidos del enum."
        },
        destacada: {
          bsonType: "bool",
          description: "Indica si la reseña está destacada por el admin del hotel."
        },
        votos_util: {
          bsonType: "int",
          minimum: 0,
          description: "Contador desnormalizado de votos de utilidad. No negativo."
        },
        respuesta: {
          bsonType: ["object", "null"],
          description: "Subdocumento embebido con la respuesta del administrador. Null si no hay.",
          required: ["texto", "fecha_respuesta", "id_admin"],
          properties: {
            texto: {
              bsonType: "string",
              minLength: 5,
              maxLength: 1000,
              description: "Texto de la respuesta oficial."
            },
            fecha_respuesta: {
              bsonType: "date",
              description: "Fecha en que se publicó o editó la respuesta."
            },
            id_admin: {
              bsonType: "int",
              minimum: 1,
              description: "ID del administrador que respondió (referencia a Oracle)."
            }
          }
        }
      },
      additionalProperties: true
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
print("✔ Esquema de validación aplicado a 'resenas'.");

db.runCommand({
  collMod: "votos_utilidad",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Esquema de validación – Voto de Utilidad",
      required: ["id_resena", "id_usuario", "fecha_voto"],
      properties: {
        id_resena: {
          bsonType: "objectId",
          description: "ObjectId de la reseña votada. Obligatorio."
        },
        id_usuario: {
          bsonType: "int",
          minimum: 1,
          description: "ID del usuario que votó (referencia a Oracle). Obligatorio."
        },
        fecha_voto: {
          bsonType: "date",
          description: "Fecha y hora del voto. Obligatoria."
        }
      },
      additionalProperties: false
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
print("✔ Esquema de validación aplicado a 'votos_utilidad'.");

print("\n=== Validaciones activas ===");
db.getCollectionInfos().forEach(col => {
  if (col.options && col.options.validator) {
    print("  •", col.name, "→ validación activa");
  }
});
