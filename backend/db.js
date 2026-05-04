// 1. Cargamos las variables de entorno de nuestro archivo .env
require('dotenv').config();

// 2. Importamos "Pool" de la librería pg. 
// Un "Pool" maneja múltiples conexiones a la base de datos de forma eficiente.
const { Pool } = require('pg');

// 3. Configuramos la conexión usando process.env (que lee el archivo .env)
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on('connect', (client) => {
    client.query('SET search_path TO ortopedia, public')
})

// 4. Hacemos una pequeña prueba automática para saber si conectó bien
pool.connect()
    .then(() => console.log('Conectado a la base de datos PostgreSQL con éxito'))
    .catch((err) => console.error('Error al conectar a la base de datos:', err));

// 5. Exportamos esta conexión para poder usarla en otros archivos (como index.js)
module.exports = pool;