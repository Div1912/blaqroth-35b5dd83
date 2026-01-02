import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  slug: z.string()
    .trim()
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  price: z.string()
    .min(1, 'Price is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Price must be a positive number'),
  compare_at_price: z.string()
    .refine(val => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Compare at price must be a positive number')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
  stock_quantity: z.string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Stock must be a non-negative number'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  category_id: z.string().optional().or(z.literal('')),
  collection_id: z.string().optional().or(z.literal('')),
});

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  slug: z.string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  image_url: z.string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  display_order: z.number().int().min(0, 'Display order must be non-negative'),
  parent_id: z.string().optional().or(z.literal('')).or(z.literal('none')),
});

// Collection validation schema
export const collectionSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Collection name is required')
    .max(100, 'Collection name must be less than 100 characters'),
  slug: z.string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #c9a962)')
    .optional()
    .or(z.literal('')),
  image_url: z.string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  display_order: z.number().int().min(0, 'Display order must be non-negative'),
  is_active: z.boolean(),
});

// Coupon validation schema
export const couponSchema = z.object({
  code: z.string()
    .trim()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code must be less than 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.string()
    .min(1, 'Discount value is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Discount value must be positive'),
  min_order_value: z.string()
    .refine(val => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Minimum order value must be non-negative')
    .optional()
    .or(z.literal('')),
  max_discount: z.string()
    .refine(val => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), 'Maximum discount must be positive')
    .optional()
    .or(z.literal('')),
  usage_limit: z.string()
    .refine(val => val === '' || (!isNaN(parseInt(val)) && parseInt(val) > 0), 'Usage limit must be a positive number')
    .optional()
    .or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => {
  if (data.discount_type === 'percentage' && data.discount_value) {
    const value = parseFloat(data.discount_value);
    return value > 0 && value <= 100;
  }
  return true;
}, {
  message: 'Percentage discount must be between 0 and 100',
  path: ['discount_value'],
});

// Offer validation schema
export const offerSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Offer title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  discount_type: z.enum(['percentage', 'flat']),
  discount_value: z.string()
    .min(1, 'Discount value is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Discount value must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  is_active: z.boolean(),
  applies_to: z.enum(['all', 'products', 'variants']),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => {
  if (data.discount_type === 'percentage' && data.discount_value) {
    const value = parseFloat(data.discount_value);
    return value > 0 && value <= 100;
  }
  return true;
}, {
  message: 'Percentage discount must be between 0 and 100',
  path: ['discount_value'],
});

// Address validation schema
export const addressSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z.string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number can only contain digits, spaces, +, -, (, )'),
  address_line1: z.string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(200, 'Address line 1 must be less than 200 characters'),
  address_line2: z.string()
    .max(200, 'Address line 2 must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),
  state: z.string()
    .trim()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),
  postal_code: z.string()
    .trim()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code must be less than 20 characters')
    .regex(/^[A-Za-z0-9\s-]+$/, 'Postal code can only contain letters, numbers, spaces, and hyphens'),
  country: z.string()
    .trim()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters'),
  is_default: z.boolean(),
});

// Product variant validation schema
export const variantSchema = z.object({
  color: z.string()
    .max(50, 'Color must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  size: z.string()
    .max(20, 'Size must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  sku: z.string()
    .max(100, 'SKU must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  price_adjustment: z.string()
    .refine(val => val === '' || !isNaN(parseFloat(val)), 'Price adjustment must be a number')
    .optional()
    .or(z.literal('')),
  stock_quantity: z.string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Stock must be a non-negative number'),
});

// Helper function to format Zod errors
export const formatZodErrors = (error: z.ZodError): string => {
  return error.errors.map(err => err.message).join(', ');
};

// Type exports
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CollectionFormData = z.infer<typeof collectionSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type OfferFormData = z.infer<typeof offerSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
