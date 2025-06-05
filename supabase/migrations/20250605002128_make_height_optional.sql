-- Hacer que el campo height sea opcional
ALTER TABLE products ALTER COLUMN height DROP NOT NULL;

-- Actualizar el comentario de la columna
COMMENT ON COLUMN products.height IS 'Alto del producto en centímetros (opcional)'; 