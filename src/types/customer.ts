export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  tax_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  total_amount: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  notes?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  product?: {
    name: string;
    description?: string;
  };
}