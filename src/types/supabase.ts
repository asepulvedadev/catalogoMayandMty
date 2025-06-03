export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          material: string
          width: number
          height: number
          unit_price: number
          bulk_price: number
          image_url: string | null
          created_at: string
          updated_at: string
          category: string
          keywords: string[]
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          material: string
          width: number
          height: number
          unit_price: number
          bulk_price: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
          category?: string
          keywords?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          material?: string
          width?: number
          height?: number
          unit_price?: number
          bulk_price?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
          category?: string
          keywords?: string[]
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_category: "christmas" | "displays" | "easter" | "frames" | "geometric_shapes" | "houses_furniture" | "kitchen_items" | "lamps_clocks" | "letters_numbers" | "living_hinges" | "mandalas_dreamcatchers" | "maps" | "masks" | "nature" | "office_supplies" | "puzzles" | "shelves" | "transportation"
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
        }
      }
      objects: {
        Row: {
          id: string
          bucket_id: string | null
          name: string | null
          owner: string | null
          created_at: string | null
          updated_at: string | null
          last_accessed_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}