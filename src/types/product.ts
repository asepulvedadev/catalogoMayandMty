export type ProductCategory = 
  | 'office_supplies'
  | 'kitchen_items'
  | 'living_hinges'
  | 'houses_furniture'
  | 'displays'
  | 'geometric_shapes'
  | 'lamps_clocks'
  | 'letters_numbers'
  | 'mandalas_dreamcatchers'
  | 'maps'
  | 'masks'
  | 'nature'
  | 'christmas'
  | 'easter'
  | 'frames'
  | 'shelves'
  | 'puzzles'
  | 'transportation';

export type Material = 'mdf' | 'acrilico' | 'pvc' | 'coroplax' | 'acetato' | 'carton' | 'tela';

export type ProductView = 'front' | 'left' | 'right' | 'perspective';

export interface ProductImages {
  front?: string;
  left?: string;
  right?: string;
  perspective?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  material: Material;
  width: number;
  length: number;
  height: number;
  unit_price: number;
  bulk_price: number;
  image_url: string | null;
  images: string[];
  product_views: ProductImages;
  created_at: string;
  updated_at: string;
  category: ProductCategory;
  keywords: string[];
  sku: string;
  qr_code: string;
}

export interface ProductFormState extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}