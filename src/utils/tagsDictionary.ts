export const commonTags = [
  // Materiales
  'mdf', 'acrílico', 'pvc', 'coroplast', 'acetato', 'cartón', 'tela', 'madera', 'triplay', 'contrachapado',
  'melamina', 'policarbonato', 'poliestireno', 'espuma', 'cuero', 'fieltro', 'papel', 'fibra', 'composite',
  
  // Técnicas de corte y grabado
  'corte láser', 'grabado', 'ensamblado', 'montaje', 'pegado', 'biselado', 'ranurado', 'engranado',
  'encajado', 'doblado', 'calado', 'perforado', 'tallado', 'marcado', 'quemado', 'pirograbado',
  'grabado vectorial', 'corte vectorial', 'corte por capas', 'grabado profundo', 'grabado superficial',
  
  // Características
  'personalizable', 'montable', 'desmontable', 'plegable', 'apilable', 'intercambiable', 'ajustable',
  'modular', 'portátil', 'reversible', 'multiuso', 'transformable', 'adaptable', 'configurable',
  
  // Usos y aplicaciones
  'decorativo', 'funcional', 'educativo', 'publicitario', 'exhibición', 'organizador', 'almacenamiento',
  'presentación', 'señalización', 'identificación', 'información', 'orientación', 'promoción',
  
  // Tamaños y dimensiones
  'pequeño', 'mediano', 'grande', 'extra grande', 'mini', 'micro', 'gigante', 'compacto', 'espacioso',
  
  // Estilos y diseños
  'minimalista', 'moderno', 'clásico', 'vintage', 'contemporáneo', 'industrial', 'rústico', 'elegante',
  'sofisticado', 'artístico', 'creativo', 'innovador', 'tradicional', 'étnico', 'bohemio', 'retro',
  
  // Aplicaciones específicas
  'hogar', 'oficina', 'escuela', 'eventos', 'exhibiciones', 'comercio', 'restaurante', 'hotel',
  'museo', 'galería', 'teatro', 'cine', 'biblioteca', 'hospital', 'clínica', 'gimnasio',
  
  // Especificaciones técnicas
  'resistente', 'ligero', 'durable', 'reutilizable', 'reciclable', 'biodegradable', 'sostenible',
  'ecológico', 'antialérgico', 'antibacterial', 'ignífugo', 'impermeable', 'resistente al agua',
  
  // Categorías de productos
  'portarretratos', 'exhibidores', 'letras', 'números', 'figuras', 'marcos', 'repisas', 'estantes',
  'rompecabezas', 'muebles', 'lámparas', 'relojes', 'cajas', 'organizadores', 'separadores',
  'soportes', 'stands', 'vitrinas', 'mostradores', 'biombos', 'divisores', 'paneles',
  
  // Artesanías y decoraciones
  'artesanía', 'manualidad', 'decoración', 'ornamento', 'adorno', 'centro de mesa', 'móvil',
  'colgante', 'escultura', 'relieve', 'bajorrelieve', 'talla', 'tallado', 'grabado artístico',
  'diseño artístico', 'arte decorativo', 'arte funcional', 'arte utilitario',
  
  // Elementos decorativos
  'flor', 'hoja', 'árbol', 'animal', 'pájaro', 'mariposa', 'insecto', 'marino', 'geometría',
  'patrón', 'textura', 'motivo', 'símbolo', 'emblema', 'logo', 'marca', 'firma',
  
  // Técnicas artísticas
  'calado artístico', 'grabado artístico', 'tallado artístico', 'pirograbado artístico',
  'quemado artístico', 'marcado artístico', 'diseño artístico', 'arte digital',
  
  // Características especiales
  'iluminado', 'interactivo', 'modular', 'ajustable', 'portátil', 'plegable', 'desmontable',
  'transformable', 'multifuncional', 'versátil', 'adaptable', 'personalizable',
  
  // Técnicas de acabado
  'pulido', 'lijado', 'barnizado', 'lacado', 'pintado', 'teñido', 'estofado', 'dorado',
  'plateado', 'cromado', 'mate', 'brillante', 'texturizado', 'grabado profundo',
  
  // Materiales adicionales
  'madera natural', 'madera tratada', 'madera reciclada', 'madera certificada',
  'plástico reciclado', 'materiales reciclados', 'materiales ecológicos',
  
  // Usos específicos
  'organizador', 'almacenamiento', 'presentación', 'decoración', 'señalización',
  'identificación', 'información', 'orientación', 'promoción', 'publicidad',
  
  // Categorías de diseño
  'diseño industrial', 'diseño gráfico', 'diseño arquitectónico', 'diseño de interiores',
  'diseño de producto', 'diseño de mobiliario', 'diseño de iluminación',
  
  // Elementos estructurales
  'estructura', 'soporte', 'base', 'marco', 'borde', 'contorno', 'perfil', 'silueta',
  'forma', 'figura', 'composición', 'ensamblaje', 'unión', 'conexión',
  
  // Características de diseño
  'simétrico', 'asimétrico', 'balanceado', 'armónico', 'proporcionado', 'equilibrado',
  'dinámico', 'estático', 'fluido', 'rígido', 'flexible', 'adaptable'
];

// Función para obtener etiquetas sugeridas basadas en el texto de entrada
export const getSuggestedTags = (input: string, currentTags: string[]): string[] => {
  const lastTag = input.split(',').pop()?.trim() || '';
  
  return commonTags.filter(tag => 
    tag.toLowerCase().includes(lastTag.toLowerCase()) &&
    !currentTags.includes(tag)
  );
}; 