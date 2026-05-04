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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});