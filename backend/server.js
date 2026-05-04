// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware para aceptar peticiones del frontend
app.use(cors());
app.use(express.json());

// RUTA DE REGISTRO (Sign Up)
app.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        // 1. Verificar si el usuario ya existe
        const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Guardar el usuario en la base de datos
        const nuevoUsuario = await db.query(
            'INSERT INTO usuarios (nombre, correo, password_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, correo',
            [nombre, correo, passwordHash]
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// RUTA DE INICIO DE SESIÓN (Login)
app.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        // 1. Buscar al usuario por correo
        const resultado = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = resultado.rows[0];

        // 2. Comparar la contraseña ingresada con la encriptada en la BD
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        // 3. Generar el Token (JWT)
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token expirará en 8 horas
        );

        // 4. Enviar el token y los datos básicos al frontend
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// ==========================================
// RUTAS DE INVENTARIO (CRUD)
// ==========================================

// OBTENER TODOS LOS ARTÍCULOS (GET /inventario)
app.get('/inventario', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM inventario ORDER BY id_articulo ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el inventario' });
    }
});

// AGREGAR NUEVO ARTÍCULO (POST /inventario)
app.post('/inventario', async (req, res) => {
    const { codigo_articulo, nombre, descripcion, categoria, cantidad_total, cantidad_disponible, estado_fisico } = req.body;
    try {
        const resultado = await db.query(
            `INSERT INTO inventario 
             (codigo_articulo, nombre, descripcion, categoria, cantidad_total, cantidad_disponible, estado_fisico) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [codigo_articulo, nombre, descripcion, categoria, cantidad_total, cantidad_disponible, estado_fisico || 'Bueno']
        );
        res.status(201).json({ mensaje: 'Artículo agregado exitosamente', articulo: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el artículo' });
    }
});

// ACTUALIZAR ARTÍCULO (PUT /inventario/:id)
app.put('/inventario/:id', async (req, res) => {
    const { id } = req.params;
    const { codigo_articulo, nombre, descripcion, categoria, cantidad_total, cantidad_disponible, estado_fisico } = req.body;
    try {
        const resultado = await db.query(
            `UPDATE inventario 
             SET codigo_articulo = COALESCE($1, codigo_articulo),
                 nombre = COALESCE($2, nombre),
                 descripcion = COALESCE($3, descripcion),
                 categoria = COALESCE($4, categoria),
                 cantidad_total = COALESCE($5, cantidad_total),
                 cantidad_disponible = COALESCE($6, cantidad_disponible),
                 estado_fisico = COALESCE($7, estado_fisico)
             WHERE id_articulo = $8 
             RETURNING *`,
            [codigo_articulo, nombre, descripcion, categoria, cantidad_total, cantidad_disponible, estado_fisico, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.json({ mensaje: 'Artículo actualizado exitosamente', articulo: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el artículo' });
    }
});

// ELIMINAR ARTÍCULO (DELETE /inventario/:id)
app.delete('/inventario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query("UPDATE inventario SET estado_fisico = 'Baja' WHERE id_articulo = $1", [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }
        res.json({ mensaje: 'Artículo eliminado exitosamente', articulo: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el artículo' });
    }
});

// ==========================================
// RUTAS DE BENEFICIARIOS
// ==========================================

// OBTENER TODOS LOS BENEFICIARIOS (GET /beneficiarios)
app.get('/beneficiarios', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM beneficiarios ORDER BY id_beneficiario ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los beneficiarios' });
    }
});

// AGREGAR NUEVO BENEFICIARIO (POST /beneficiarios)
app.post('/beneficiarios', async (req, res) => {
    const { nombre_completo, identificacion, telefono, correo, direccion } = req.body;
    try {
        // Validación de Identificación Única
        const existe = await db.query('SELECT id_beneficiario FROM beneficiarios WHERE identificacion = $1', [identificacion]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'Este usuario ya está registrado' });
        }

        const resultado = await db.query(
            `INSERT INTO beneficiarios 
             (nombre_completo, identificacion, telefono, correo, direccion) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [nombre_completo, identificacion, telefono, correo, direccion]
        );
        res.status(201).json({ mensaje: 'Beneficiario agregado exitosamente', beneficiario: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Postgres Unique Violation
            return res.status(400).json({ error: 'Este usuario ya está registrado' });
        }
        res.status(500).json({ error: 'Error al agregar el beneficiario' });
    }
});

// ACTUALIZAR BENEFICIARIO (PUT /beneficiarios/:id)
app.put('/beneficiarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, identificacion, telefono, correo, direccion } = req.body;
    try {
        // Verificar si la nueva identificación ya pertenece a otro usuario
        if (identificacion) {
            const existe = await db.query('SELECT id_beneficiario FROM beneficiarios WHERE identificacion = $1 AND id_beneficiario != $2', [identificacion, id]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'Este usuario ya está registrado con la misma identificación' });
            }
        }

        const resultado = await db.query(
            `UPDATE beneficiarios 
             SET nombre_completo = COALESCE($1, nombre_completo),
                 identificacion = COALESCE($2, identificacion),
                 telefono = COALESCE($3, telefono),
                 correo = COALESCE($4, correo),
                 direccion = COALESCE($5, direccion)
             WHERE id_beneficiario = $6 
             RETURNING *`,
            [nombre_completo, identificacion, telefono, correo, direccion, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Beneficiario no encontrado' });
        }
        res.json({ mensaje: 'Beneficiario actualizado exitosamente', beneficiario: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el beneficiario' });
    }
});

// ELIMINAR BENEFICIARIO (DELETE /beneficiarios/:id)
app.delete('/beneficiarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar si tiene historial de préstamos (llave foránea)
        const prestamos = await db.query('SELECT id_prestamo FROM prestamos WHERE id_beneficiario = $1 LIMIT 1', [id]);
        if (prestamos.rows.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar: El beneficiario tiene un historial de préstamos.' });
        }

        const resultado = await db.query('DELETE FROM beneficiarios WHERE id_beneficiario = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Beneficiario no encontrado' });
        }
        res.json({ mensaje: 'Beneficiario eliminado exitosamente', beneficiario: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el beneficiario. Verifique que no tenga dependencias.' });
    }
});

// ==========================================
// RUTAS DE PRÉSTAMOS
// ==========================================

// OBTENER TODOS LOS PRÉSTAMOS (GET /prestamos)
app.get('/prestamos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id_prestamo,
                p.fecha_prestamo,
                p.fecha_limite_devolucion,
                p.estado_prestamo,
                p.observaciones,
                i.nombre AS nombre_articulo,
                b.nombre_completo AS nombre_beneficiario,
                b.id_beneficiario
            FROM prestamos p
            JOIN inventario i ON p.id_articulo = i.id_articulo
            JOIN beneficiarios b ON p.id_beneficiario = b.id_beneficiario
            ORDER BY p.fecha_prestamo DESC
        `;
        const resultado = await db.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los préstamos' });
    }
});

app.post('/prestamos', async (req, res) => {
    // La base de datos asume 1 artículo por registro de préstamo, así que se restará 1 unidad.
    const { id_articulo, id_beneficiario, id_usuario_autoriza, fecha_limite_devolucion, observaciones } = req.body;

    const cliente = await db.connect();
    try {
        await cliente.query('BEGIN'); // Iniciar transacción

        // 1. Verificar stock
        const art = await cliente.query('SELECT cantidad_disponible FROM inventario WHERE id_articulo = $1', [id_articulo]);
        if (art.rows.length === 0) throw new Error('Artículo no encontrado');
        if (art.rows[0].cantidad_disponible < 1) throw new Error('Stock insuficiente para realizar el préstamo');

        // 2. Descontar 1 unidad del inventario
        await cliente.query('UPDATE inventario SET cantidad_disponible = cantidad_disponible - 1 WHERE id_articulo = $1', [id_articulo]);

        // 3. Registrar préstamo
        const prestamo = await cliente.query(
            `INSERT INTO prestamos (id_articulo, id_beneficiario, id_usuario_autoriza, fecha_limite_devolucion, observaciones)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_articulo, id_beneficiario, id_usuario_autoriza || 1, fecha_limite_devolucion, observaciones]
        );

        await cliente.query('COMMIT'); // Confirmar cambios
        res.status(201).json({ mensaje: 'Préstamo registrado y stock descontado exitosamente', prestamo: prestamo.rows[0] });
    } catch (error) {
        await cliente.query('ROLLBACK'); // Revertir en caso de error
        console.error(error);
        res.status(400).json({ error: error.message || 'Error al registrar el préstamo' });
    } finally {
        cliente.release(); // Liberar conexión al pool
    }
});

// CANCELAR PRÉSTAMO (PUT /prestamos/:id/cancelar)
app.put('/prestamos/:id/cancelar', async (req, res) => {
    const { id } = req.params;
    const cliente = await db.connect();
    try {
        await cliente.query('BEGIN'); // Iniciar transacción

        // 1. Verificar si el préstamo está activo
        const prestamo = await cliente.query('SELECT * FROM prestamos WHERE id_prestamo = $1 AND estado_prestamo = $2', [id, 'Activo']);
        if (prestamo.rows.length === 0) throw new Error('El préstamo no se encontró o no está Activo');

        const id_articulo = prestamo.rows[0].id_articulo;

        // 2. Cambiar estado a Cancelado
        await cliente.query("UPDATE prestamos SET estado_prestamo = 'Cancelado' WHERE id_prestamo = $1", [id]);

        // 3. Devolver el stock
        await cliente.query('UPDATE inventario SET cantidad_disponible = cantidad_disponible + 1 WHERE id_articulo = $1', [id_articulo]);

        await cliente.query('COMMIT');
        res.json({ mensaje: 'Préstamo cancelado exitosamente' });
    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ error: error.message || 'Error al cancelar el préstamo' });
    } finally {
        cliente.release();
    }
});

// ==========================================
// RUTAS DE DEVOLUCIONES
// ==========================================

app.post('/devoluciones', async (req, res) => {
    const { id_prestamo, id_usuario_recibe, estado_fisico_recibido, multa_o_cargo, observaciones } = req.body;

    const cliente = await db.connect();
    try {
        await cliente.query('BEGIN'); // Iniciar transacción

        // 1. Verificar que el préstamo exista y esté activo
        const prestamo = await cliente.query('SELECT * FROM prestamos WHERE id_prestamo = $1 AND estado_prestamo = $2', [id_prestamo, 'Activo']);
        if (prestamo.rows.length === 0) throw new Error('Préstamo no encontrado o ya fue devuelto');
        
        const id_articulo = prestamo.rows[0].id_articulo;

        // 2. Cambiar estado del préstamo a Devuelto
        await cliente.query('UPDATE prestamos SET estado_prestamo = $1 WHERE id_prestamo = $2', ['Devuelto', id_prestamo]);

        // 3. Registrar la devolución
        const devolucion = await cliente.query(
            `INSERT INTO devoluciones (id_prestamo, id_usuario_recibe, estado_fisico_recibido, multa_o_cargo, observaciones)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_prestamo, id_usuario_recibe || 1, estado_fisico_recibido, multa_o_cargo || 0, observaciones]
        );

        // 4. Devolver 1 unidad al inventario y actualizar su estado físico
        await cliente.query(
            'UPDATE inventario SET cantidad_disponible = cantidad_disponible + 1, estado_fisico = $1 WHERE id_articulo = $2', 
            [estado_fisico_recibido, id_articulo]
        );

        await cliente.query('COMMIT'); // Confirmar cambios
        res.status(201).json({ mensaje: 'Devolución registrada y stock restaurado exitosamente', devolucion: devolucion.rows[0] });
    } catch (error) {
        await cliente.query('ROLLBACK'); // Revertir cambios
        console.error(error);
        res.status(400).json({ error: error.message || 'Error al registrar la devolución' });
    } finally {
        cliente.release();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});