export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string | null
          created_at: string | null
          customer_id: string
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string
          state: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          customer_id: string
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code: string
          state: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          customer_id?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          link: string | null
          link_text: string | null
          message: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          link_text?: string | null
          message: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          link_text?: string | null
          message?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          start_date: string
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          start_date: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          start_date?: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          phone_country_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          phone_country_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_country_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      editorial_grid_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string | null
          display_order: number | null
          headline: string
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string
          primary_cta_link: string | null
          primary_cta_text: string | null
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          subheadline: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          headline: string
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url: string
          primary_cta_link?: string | null
          primary_cta_text?: string | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subheadline?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          headline?: string
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string
          primary_cta_link?: string | null
          primary_cta_text?: string | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subheadline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_products: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_variants: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          variant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_variants_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_variants_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          applies_to: string | null
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          applies_to?: string | null
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          order_id: string
          original_price: number | null
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
          sku: string | null
          subtotal: number
          variant_details: string | null
          variant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id: string
          original_price?: number | null
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          size?: string | null
          sku?: string | null
          subtotal: number
          variant_details?: string | null
          variant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string
          original_price?: number | null
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          sku?: string | null
          subtotal?: number
          variant_details?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_fulfillment_status: string | null
          new_status: string
          notes: string | null
          old_fulfillment_status: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_fulfillment_status?: string | null
          new_status: string
          notes?: string | null
          old_fulfillment_status?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_fulfillment_status?: string | null
          new_status?: string
          notes?: string | null
          old_fulfillment_status?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          created_at: string | null
          customer_id: string | null
          delivery_mode: string | null
          email: string
          fulfillment_status: string | null
          full_name: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          phone: string
          shipping_address_id: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_cost: number | null
          shipping_country: string | null
          shipping_partner: string | null
          shipping_postal_code: string
          shipping_state: string
          status: string | null
          subtotal: number
          tax: number | null
          total: number
          tracking_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_mode?: string | null
          email: string
          fulfillment_status?: string | null
          full_name: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          phone: string
          shipping_address_id?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_partner?: string | null
          shipping_postal_code: string
          shipping_state: string
          status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          tracking_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_mode?: string | null
          email?: string
          fulfillment_status?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          phone?: string
          shipping_address_id?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_partner?: string | null
          shipping_postal_code?: string
          shipping_state?: string
          status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_primary: boolean | null
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care_instructions: string | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          created_at: string | null
          description: string | null
          fabric_type: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          sku: string | null
          slug: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          care_instructions?: string | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          fabric_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          care_instructions?: string | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          fabric_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          additional_notes: string | null
          admin_note: string | null
          created_at: string | null
          customer_id: string
          id: string
          order_id: string
          order_item_id: string | null
          product_id: string | null
          product_name: string
          reason: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          admin_note?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          order_id: string
          order_item_id?: string | null
          product_id?: string | null
          product_name: string
          reason: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          admin_note?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          order_id?: string
          order_item_id?: string | null
          product_id?: string | null
          product_name?: string
          reason?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
