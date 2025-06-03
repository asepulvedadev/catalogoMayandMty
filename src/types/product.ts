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

export interface Product {
  id: string;
  name: string;
  description: string | null;
  material: string; // Changed from Material to string
  width: number;
  height: number;
  unit_price: number;
  bulk_price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category: string; // Changed from ProductCategory to string
  keywords: string[];
}

export interface ProductFormState {
  id?: string;
  name: string;
  description: string | null;
  material: string; // Changed from Material to string
  width: number;
  height: number;
  unit_price: number;
  bulk_price: number;
  image_url: string | null;
  category: string; // Changed from ProductCategory to string
  keywords: string[];
}