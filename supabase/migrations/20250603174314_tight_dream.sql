/*
  # Add sample products for catalog

  1. New Data
    - Adds initial product catalog items
    - Includes various materials and sizes
*/

INSERT INTO products (name, description, material, width, height, unit_price, bulk_price, image_url)
VALUES 
  (
    'Prensa Francesa Cooker',
    'Prensa francesa de alta calidad, perfecta para preparar café. Fabricada con materiales premium.',
    'acrilico',
    12.5,
    25.0,
    29.99,
    24.99,
    'https://images.pexels.com/photos/3020919/pexels-photo-3020919.jpeg'
  ),
  (
    'Set Cafetero Amazoo',
    'Set completo para café que incluye prensa y accesorios. Diseño moderno y funcional.',
    'mdf',
    30.0,
    40.0,
    45.99,
    39.99,
    'https://images.pexels.com/photos/1207918/pexels-photo-1207918.jpeg'
  ),
  (
    'Taza Iglasi',
    'Taza transparente de doble pared, perfecta para bebidas calientes.',
    'acrilico',
    8.5,
    12.0,
    15.99,
    12.99,
    'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg'
  ),
  (
    'Set Taza Tisana',
    'Set elegante para té que incluye taza y base de madera.',
    'mdf',
    15.0,
    15.0,
    19.99,
    16.99,
    'https://images.pexels.com/photos/1566308/pexels-photo-1566308.jpeg'
  );