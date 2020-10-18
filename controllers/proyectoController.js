const Proyecto = require('../models/Proyecto');
const {validationResult} = require('express-validator');
const { rawListeners } = require('../models/Proyecto');

exports.crearProyecto = async (req, res) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    try {
        // crear un nuevo proyecto
        const proyecto = new Proyecto(req.body);

        // guardar el creador via jwt
        proyecto.creador = req.usuario.id;

        // guardamos el proyecto
        proyecto.save();
        res.json(proyecto);
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// obtiene todos los proyectos del usuario actual
exports.obtenerProyectos = async (req, res) => {
    try {
       const proyectos = await Proyecto.find({creador: req.usuario.id}).sort({creado: -1});
       res.json({proyectos});
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// actualiza un proyecto
exports.actualizarProyecto = async (req, res) => {
 
    //Revisar si hay errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errores: errors.array()
        });
    }
 
    //Extraer la informacion del proyecto
    const {nombre} = req.body;
    const nuevoProyecto = {};
 
    if (nombre) {
        nuevoProyecto.nombre = nombre;
    }
 
    try {
 
        //Revisar el id
        await Proyecto.findById(req.params.id, (err, proyecto) => {
 
            //Si el proyecto existe o no
            if (err || !proyecto) {
                return res.status(404).json({
                    msg: 'Proyecto no encontrado'
                });
            }
 
            //Verificar el creador del proyecto
            if (proyecto.creador.toString() !== req.usuario.id) {
                return res.status(401).json({
                    msg: 'No Autorizado'
                });
            }
        });
 
        //Actualizar
        let proyectoActualizado = await Proyecto.findByIdAndUpdate(
            {_id: req.params.id}, {$set: nuevoProyecto}, {new: true});
 
        res.json(proyectoActualizado)
 
 
    } catch (e) {
        console.log(e)
        res.status(500).send('Hubo un error en el servidor');
    }
}

// elimina un proyecto por su id
exports.eliminarProyecto = async (req, res) => {
    try {
        //Revisar el id
        await Proyecto.findById(req.params.id, (err, proyecto) => {
 
            //Si el proyecto existe o no
            if (err || !proyecto) {
                return res.status(404).json({
                    msg: 'Proyecto no encontrado'
                });
            }
 
            //Verificar el creador del proyecto
            if (proyecto.creador.toString() !== req.usuario.id) {
                return res.status(401).json({
                    msg: 'No Autorizado'
                });
            }
        });
        
        // eliminar proyecto
        await Proyecto.findOneAndRemove({_id: req.params.id});
        res.json({msg: 'Proyecto eliminado'})
 
 
    } catch (error) {
        console.log(error)
        res.status(500).send('Hubo un error en el servidor');
    }
}