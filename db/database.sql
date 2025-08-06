Create database IF NOT EXISTS gastosdb;

USE gastosdb;

CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(45) DEFAULT NULL,
    rol ENUM('free', 'premium') DEFAULT 'free',
    PRIMARY KEY (id)
);

DESCRIBE users;

INSERT INTO users VALUES
(1,'JOE'),
(2,'Henry'),
(3,'Sam'),
(4,'Max'),
(5,'Val');

-- Tabla de mapeo de usuarios de Clerk
CREATE TABLE clerk_users (
    id INT NOT NULL AUTO_INCREMENT,
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de presupuestos
CREATE TABLE presupuestos (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo ENUM('semanal', 'mensual', 'personalizado') NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    saldo_disponible DECIMAL(10,2) NOT NULL,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    estado ENUM('activo', 'archivado') DEFAULT 'activo',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

DESCRIBE clerk_users;
DESCRIBE presupuestos;

-- Tabla de categorías
CREATE TABLE categorias (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('ingreso', 'gasto') NOT NULL,
    icono VARCHAR(100),
    color VARCHAR(20),
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

DESCRIBE categorias;

-- Tabla de transacciones
CREATE TABLE transacciones (
    id INT NOT NULL AUTO_INCREMENT,
    presupuesto_id INT NOT NULL,
    tipo ENUM('ingreso', 'gasto') NOT NULL,
    categoria_id INT NULL,
    descripcion TEXT,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATETIME NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

DESCRIBE transacciones;

-- Tabla de resumen de ciclo de presupuesto
CREATE TABLE resumen_ciclo_presupuesto (
    id INT NOT NULL AUTO_INCREMENT,
    presupuesto_id INT NOT NULL,
    fecha_cierre DATETIME NOT NULL,
    total_ingresos DECIMAL(10,2) NOT NULL,
    total_gastos DECIMAL(10,2) NOT NULL,
    saldo_final DECIMAL(10,2) NOT NULL,
    accion_sobrante ENUM('agregar_al_siguiente', 'enviar_a_ahorro', 'restar_al_siguiente', 'ninguna') NOT NULL,
    monto_accion DECIMAL(10,2) NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
);

DESCRIBE resumen_ciclo_presupuesto;