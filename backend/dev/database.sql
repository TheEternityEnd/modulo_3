-- 1. Tabla de Usuarios (Maneja el Login y el control de acceso)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operador', -- Ej: 'admin', 'operador'
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verificado boolean default false 
);

-- 2. Tabla de Beneficiarios (Las personas que reciben los préstamos)
CREATE TABLE beneficiarios (
    id_beneficiario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    identificacion VARCHAR(50) UNIQUE NOT NULL, -- Matrícula, DNI, etc.
    telefono VARCHAR(20),
    correo VARCHAR(150),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Inventario (Los artículos disponibles para prestar)
CREATE TABLE inventario (
    id_articulo SERIAL PRIMARY KEY,
    codigo_articulo VARCHAR(50) UNIQUE NOT NULL, -- SKU o Código de barras
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    cantidad_total INTEGER NOT NULL DEFAULT 1,
    cantidad_disponible INTEGER NOT NULL DEFAULT 1,
    estado_fisico VARCHAR(50) DEFAULT 'Bueno', -- Ej: Bueno, Regular, Dañado
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Préstamos (Registra la salida del inventario hacia un beneficiario)
CREATE TABLE prestamos (
    id_prestamo SERIAL PRIMARY KEY,
    id_articulo INTEGER NOT NULL REFERENCES inventario(id_articulo),
    id_beneficiario INTEGER NOT NULL REFERENCES beneficiarios(id_beneficiario),
    id_usuario_autoriza INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_devolucion DATE NOT NULL,
    estado_prestamo VARCHAR(50) DEFAULT 'Activo', -- Ej: Activo, Devuelto, Vencido
    observaciones TEXT
);

-- 5. Tabla de Devoluciones (Registra el retorno del artículo y su estado)
CREATE TABLE devoluciones (
    id_devolucion SERIAL PRIMARY KEY,
    id_prestamo INTEGER NOT NULL UNIQUE REFERENCES prestamos(id_prestamo),
    id_usuario_recibe INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_fisico_recibido VARCHAR(50) NOT NULL, -- Para comparar si se devolvió dañado
    multa_o_cargo DECIMAL(10, 2) DEFAULT 0.00, -- Opcional, por si hay cobros por daño o retraso
    observaciones TEXT
);

-- (Opcional) Índices para mejorar la velocidad de los reportes y el dashboard
CREATE INDEX idx_prestamos_estado ON prestamos(estado_prestamo);
CREATE INDEX idx_inventario_disponible ON inventario(cantidad_disponible);