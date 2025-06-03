/*
  # Add sample products

  1. New Data
    - Adds 20 sample products across different categories
    - Each product includes:
      - Name
      - Description
      - Material
      - Dimensions
      - Prices
      - Category
      - Keywords for search
*/

INSERT INTO products (name, description, material, width, height, unit_price, bulk_price, category, keywords, image_url)
VALUES
  ('Organizador de Escritorio', 'Organizador modular para artículos de oficina', 'mdf', 30, 20, 299.99, 249.99, 'office_supplies', ARRAY['organizador', 'escritorio', 'oficina', 'papelería'], 'https://images.pexels.com/photos/5702281/pexels-photo-5702281.jpeg'),
  ('Porta Especias Giratorio', 'Organizador giratorio para especias y condimentos', 'acrilico', 20, 30, 399.99, 349.99, 'kitchen_items', ARRAY['especias', 'cocina', 'organizador', 'giratorio'], 'https://images.pexels.com/photos/4226896/pexels-photo-4226896.jpeg'),
  ('Caja Flexible', 'Caja con bisagras vivas para almacenamiento', 'mdf', 15, 10, 199.99, 169.99, 'living_hinges', ARRAY['caja', 'almacenamiento', 'flexible', 'bisagras'], 'https://images.pexels.com/photos/4226805/pexels-photo-4226805.jpeg'),
  ('Casa de Muñecas Moderna', 'Casa de muñecas estilo contemporáneo', 'mdf', 60, 80, 899.99, 799.99, 'houses_furniture', ARRAY['casa', 'muñecas', 'juguete', 'moderno'], 'https://images.pexels.com/photos/3933240/pexels-photo-3933240.jpeg'),
  ('Exhibidor de Joyería', 'Exhibidor multinivel para joyería', 'acrilico', 25, 35, 449.99, 399.99, 'displays', ARRAY['joyería', 'exhibidor', 'organizador'], 'https://images.pexels.com/photos/5702355/pexels-photo-5702355.jpeg'),
  ('Set Figuras Geométricas', 'Conjunto de figuras geométricas decorativas', 'mdf', 40, 40, 349.99, 299.99, 'geometric_shapes', ARRAY['geometría', 'decoración', 'figuras'], 'https://images.pexels.com/photos/5702357/pexels-photo-5702357.jpeg'),
  ('Lámpara Moderna LED', 'Lámpara decorativa con diseño geométrico', 'acrilico', 20, 40, 599.99, 549.99, 'lamps_clocks', ARRAY['lámpara', 'led', 'decoración', 'moderno'], 'https://images.pexels.com/photos/5702359/pexels-photo-5702359.jpeg'),
  ('Letras 3D Personalizables', 'Set de letras 3D para decoración', 'mdf', 15, 20, 149.99, 129.99, 'letters_numbers', ARRAY['letras', 'números', 'decoración', '3d'], 'https://images.pexels.com/photos/5702361/pexels-photo-5702361.jpeg'),
  ('Mandala Decorativo XL', 'Mandala grande para decoración de pared', 'mdf', 80, 80, 699.99, 649.99, 'mandalas_dreamcatchers', ARRAY['mandala', 'decoración', 'pared', 'grande'], 'https://images.pexels.com/photos/5702363/pexels-photo-5702363.jpeg'),
  ('Mapa Mundial Decorativo', 'Mapa mundial para decoración de pared', 'mdf', 120, 60, 899.99, 849.99, 'maps', ARRAY['mapa', 'mundo', 'decoración', 'pared'], 'https://images.pexels.com/photos/5702365/pexels-photo-5702365.jpeg'),
  ('Set Máscaras Decorativas', 'Conjunto de máscaras decorativas', 'mdf', 20, 30, 249.99, 219.99, 'masks', ARRAY['máscaras', 'decoración', 'pared'], 'https://images.pexels.com/photos/5702367/pexels-photo-5702367.jpeg'),
  ('Árbol Decorativo', 'Árbol decorativo para pared', 'mdf', 60, 90, 499.99, 449.99, 'nature', ARRAY['árbol', 'naturaleza', 'decoración', 'pared'], 'https://images.pexels.com/photos/5702369/pexels-photo-5702369.jpeg'),
  ('Set Decoración Navideña', 'Conjunto de adornos navideños', 'mdf', 40, 40, 399.99, 349.99, 'christmas', ARRAY['navidad', 'decoración', 'adornos'], 'https://images.pexels.com/photos/5702371/pexels-photo-5702371.jpeg'),
  ('Decoración Pascua', 'Set de decoraciones para pascua', 'mdf', 30, 30, 299.99, 269.99, 'easter', ARRAY['pascua', 'decoración', 'primavera'], 'https://images.pexels.com/photos/5702373/pexels-photo-5702373.jpeg'),
  ('Marco Fotográfico 3D', 'Marco de fotos con efecto tridimensional', 'mdf', 25, 30, 199.99, 179.99, 'frames', ARRAY['marco', 'fotos', '3d', 'decoración'], 'https://images.pexels.com/photos/5702375/pexels-photo-5702375.jpeg'),
  ('Repisa Modular', 'Sistema de repisas modulares', 'mdf', 45, 30, 349.99, 319.99, 'shelves', ARRAY['repisa', 'modular', 'almacenamiento'], 'https://images.pexels.com/photos/5702377/pexels-photo-5702377.jpeg'),
  ('Rompecabezas 3D Ciudad', 'Rompecabezas tridimensional de ciudad', 'mdf', 40, 30, 299.99, 269.99, 'puzzles', ARRAY['rompecabezas', '3d', 'ciudad', 'juego'], 'https://images.pexels.com/photos/5702379/pexels-photo-5702379.jpeg'),
  ('Tren Decorativo', 'Modelo decorativo de tren', 'mdf', 60, 20, 399.99, 369.99, 'transportation', ARRAY['tren', 'transporte', 'decoración', 'modelo'], 'https://images.pexels.com/photos/5702381/pexels-photo-5702381.jpeg'),
  ('Organizador Escritorio Modular', 'Sistema modular para organización de escritorio', 'acrilico', 35, 25, 449.99, 399.99, 'office_supplies', ARRAY['organizador', 'escritorio', 'modular', 'oficina'], 'https://images.pexels.com/photos/5702383/pexels-photo-5702383.jpeg'),
  ('Porta Cubiertos', 'Organizador de cubiertos para cocina', 'acrilico', 25, 35, 299.99, 269.99, 'kitchen_items', ARRAY['cocina', 'cubiertos', 'organizador'], 'https://images.pexels.com/photos/5702385/pexels-photo-5702385.jpeg');