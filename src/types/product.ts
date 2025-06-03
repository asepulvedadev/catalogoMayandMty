export type Material = 'mdf' | 'acrilico' | 'pvc' | 'coroplax' | 'acetato' | 'carton' | 'tela';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  material: Material;
  width: number;
  height: number;
  unit_price: number;
  bulk_price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  material: Material;
  width: number;
  height: number;
  unit_price: number;
  bulk_price: number;
  image_url: string;
}