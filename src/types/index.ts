export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  collection: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  featured?: boolean;
  isNew?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: Address;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  addresses: Address[];
  orders: Order[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  image?: string;
  products: Product[];
}
