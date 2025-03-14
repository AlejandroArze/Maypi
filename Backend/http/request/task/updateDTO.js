const Joi = require("joi"); // Importa la librería Joi para la validación de datos.
const { Task } = require("../../../models"); // Importa el modelo 'Task' desde los modelos de base de datos.
const { Op } = require("sequelize"); // Importa 'Op' de Sequelize para utilizar operadores como 'not equal' (Op.ne) en las consultas.

// Define el esquema de validación para la actualización de una tarea.
const updateDTO = Joi.object({

    // Validación del campo 'tareas_id', que debe ser un número entero.
    tareas_id: Joi.number().integer()
        .required() // El campo 'tareas_id' es obligatorio.
        .external( // Validación externa del 'tareas_id' para verificar si existe en la base de datos.
            async (tareas_id) => {
                const exists = await Task.findByPk(tareas_id); // Busca la tarea por su ID (tareas_id) en la base de datos.
                if (!exists) { // Si no existe, lanza un error de validación.
                    throw new Joi.ValidationError('ID does not exist', [{ // Error de validación indicando que el ID no existe.
                        message: 'ID does not exist', // Mensaje de error.
                        path: ['tareas_id'], // Ruta del campo que generó el error (en este caso, 'tareas_id').
                        type: 'id.not_found', // Tipo de error indicando que el ID no fue encontrado.
                        context: { key: 'tareas_id' } // Contexto del error, con la clave 'tareas_id'.
                    }], tareas_id);
                }
            })
        .messages({
            'number.base': 'El ID debe ser un número entero', // Mensaje de error si el ID no es un número entero.
            'any.required': 'El ID es obligatorio' // Mensaje de error si el ID es obligatorio y no está presente.
        }),

    // Validación del campo 'descripcion'.
    descripcion: Joi.string() // Define que el campo 'descripcion' debe ser una cadena de texto.
        .required() // El campo 'descripcion' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima (ajusta según tus necesidades).

    // Validación del campo 'servicio', que es una referencia a la tabla 'servicios'.
    servicio: Joi.number().integer() // Define que el campo 'servicio' debe ser un número entero.
        .required(), // El campo 'servicio' es obligatorio.

    // Validación del campo 'fecha', que es de tipo texto.
    fecha: Joi.string() // Define que el campo 'fecha' debe ser una cadena de texto.
        .required() // El campo 'fecha' es obligatorio.
        .min(1) // Asegura que no sea una cadena vacía.
        .max(255), // Limita la longitud máxima.
});

// Exporta el esquema de validación para que pueda ser utilizado en otras partes de la aplicación.
module.exports = updateDTO;
