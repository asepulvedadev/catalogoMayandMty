-- Agregar el campo length a la tabla de productos
ALTER TABLE products ADD COLUMN length numeric(10,2) NOT NULL DEFAULT 0;

-- Actualizar los registros existentes para que length sea igual a width (temporalmente)
UPDATE products SET length = width;

-- Agregar comentario a la columna
COMMENT ON COLUMN products.length IS 'Largo del producto en centímetros'; 