import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Image as ImageIcon, Package, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';
import { productSchema, variantSchema, formatZodErrors } from '@/lib/validationSchemas';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  category_id: string | null;
  collection_id: string | null;
}

interface Collection {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  price_adjustment: number | null;
  stock_quantity: number | null;
  total_stock: number;
  reserved_stock: number;
}

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState({ color: '', size: '', sku: '', price_adjustment: '0', stock_quantity: '0' });
  
  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    compare_at_price: '',
    description: '',
    is_active: true,
    is_featured: false,
    stock_quantity: '0',
    category_id: '',
    collection_id: '',
  });

  // Low stock products - use available_stock (total_stock - reserved_stock)
  const lowStockProducts = products.filter(p => {
    const availableStock = variants
      .filter(v => v.product_id === p.id)
      .reduce((sum, v) => sum + ((v.total_stock || 0) - (v.reserved_stock || 0)), 0);
    return availableStock <= 3 && availableStock > 0;
  });

  const outOfStockProducts = products.filter(p => {
    const availableStock = variants
      .filter(v => v.product_id === p.id)
      .reduce((sum, v) => sum + ((v.total_stock || 0) - (v.reserved_stock || 0)), 0);
    return availableStock === 0;
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCollections();
    fetchAllVariants();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const fetchCollections = async () => {
    const { data } = await supabase.from('collections').select('id, name').eq('is_active', true);
    setCollections(data || []);
  };

  const fetchAllVariants = async () => {
    const { data } = await supabase.from('product_variants').select('*');
    setVariants(data || []);
  };

  const fetchProductVariants = async (productId: string) => {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('color', { ascending: true });
    return data || [];
  };

  const fetchProductImages = async (productId: string) => {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });
    return data || [];
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationResult = productSchema.safeParse(formData);
    
    if (!validationResult.success) {
      toast.error(formatZodErrors(validationResult.error));
      return;
    }
    
    const productData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      description: formData.description || null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: formData.category_id || null,
      collection_id: formData.collection_id || null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
        fetchProducts();
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create product');
      } else {
        toast.success('Product created successfully');
        setEditingProduct(data);
        setActiveTab('variants');
        fetchProducts();
      }
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      description: product.description || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id || '',
      collection_id: product.collection_id || '',
    });
    
    // Fetch variants and images
    const [productVariants, productImages] = await Promise.all([
      fetchProductVariants(product.id),
      fetchProductImages(product.id),
    ]);
    setVariants(prev => [...prev.filter(v => v.product_id !== product.id), ...productVariants]);
    setImages(productImages);
    setActiveTab('details');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all variants and images.')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const handleAddVariant = async () => {
    if (!editingProduct) return;
    
    // Validate variant data
    const validationResult = variantSchema.safeParse(variantForm);
    
    if (!validationResult.success) {
      toast.error(formatZodErrors(validationResult.error));
      return;
    }
    
    const stockQty = parseInt(variantForm.stock_quantity) || 0;
    const { data, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: editingProduct.id,
        color: variantForm.color || null,
        size: variantForm.size || null,
        sku: variantForm.sku || null,
        price_adjustment: parseFloat(variantForm.price_adjustment) || 0,
        stock_quantity: stockQty,
        total_stock: stockQty,
        reserved_stock: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add variant');
    } else {
      toast.success('Variant added');
      setVariants(prev => [...prev, { ...data, total_stock: stockQty, reserved_stock: 0 }]);
      setVariantForm({ color: '', size: '', sku: '', price_adjustment: '0', stock_quantity: '0' });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
    if (error) {
      toast.error('Failed to delete variant');
    } else {
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success('Variant deleted');
    }
  };

  const handleUpdateVariantStock = async (variantId: string, newStock: number) => {
    // Update total_stock - this represents physical inventory
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;
    
    const { error } = await supabase
      .from('product_variants')
      .update({ 
        stock_quantity: newStock,
        total_stock: newStock
      })
      .eq('id', variantId);

    if (error) {
      toast.error('Failed to update stock');
    } else {
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock_quantity: newStock, total_stock: newStock } : v));
      toast.success('Stock updated');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct || !e.target.files?.length) return;
    
    setUploadingImage(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${editingProduct.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: editingProduct.id,
        url: publicUrl,
        alt_text: editingProduct.name,
        is_primary: images.length === 0,
        display_order: images.length,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to save image');
    } else {
      setImages(prev => [...prev, data]);
      toast.success('Image uploaded');
    }
    setUploadingImage(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    const { error } = await supabase.from('product_images').delete().eq('id', imageId);
    if (error) {
      toast.error('Failed to delete image');
    } else {
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success('Image deleted');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!editingProduct) return;
    
    // Reset all images to non-primary
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', editingProduct.id);

    // Set selected as primary
    await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imageId })));
    toast.success('Primary image updated');
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      price: '',
      compare_at_price: '',
      description: '',
      is_active: true,
      is_featured: false,
      stock_quantity: '0',
      category_id: '',
      collection_id: '',
    });
    // Don't reset variants here - it clears the global variants list used for stock calculation
    // Instead, refetch all variants to ensure we have the latest data
    fetchAllVariants();
    setImages([]);
    setActiveTab('details');
  };

  const productVariants = editingProduct 
    ? variants.filter(v => v.product_id === editingProduct.id)
    : [];

  const getProductStock = (productId: string) => {
    // Return available stock (total_stock - reserved_stock)
    return variants
      .filter(v => v.product_id === productId)
      .reduce((sum, v) => sum + ((v.total_stock || 0) - (v.reserved_stock || 0)), 0);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Out of Stock ({outOfStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {outOfStockProducts.slice(0, 3).map(p => (
                    <p key={p.id}>{p.name}</p>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <p className="text-muted-foreground">+{outOfStockProducts.length - 3} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockProducts.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
                  <Package className="h-4 w-4" />
                  Low Stock ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {lowStockProducts.slice(0, 3).map(p => (
                    <p key={p.id}>{p.name} - {getProductStock(p.id)} left</p>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <p className="text-muted-foreground">+{lowStockProducts.length - 3} more</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="variants" disabled={!editingProduct}>
                  Variants {productVariants.length > 0 && `(${productVariants.length})`}
                </TabsTrigger>
                <TabsTrigger value="images" disabled={!editingProduct}>
                  Images {images.length > 0 && `(${images.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="auto-generated-from-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compare_at_price">Compare at Price (₹)</Label>
                      <Input
                        id="compare_at_price"
                        type="number"
                        step="0.01"
                        value={formData.compare_at_price}
                        onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="collection">Collection</Label>
                      <Select
                        value={formData.collection_id}
                        onValueChange={(value) => setFormData({ ...formData, collection_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((col) => (
                            <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Featured</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="variants" className="space-y-6">
                {/* Add Variant Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Variant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      <Input
                        placeholder="Color"
                        value={variantForm.color}
                        onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                      />
                      <Input
                        placeholder="Size"
                        value={variantForm.size}
                        onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                      />
                      <Input
                        placeholder="SKU"
                        value={variantForm.sku}
                        onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Price Adj."
                        value={variantForm.price_adjustment}
                        onChange={(e) => setVariantForm({ ...variantForm, price_adjustment: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={variantForm.stock_quantity}
                          onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                        />
                        <Button onClick={handleAddVariant} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Variants List */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price Adj.</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productVariants.map((variant) => {
                      const availableStock = (variant.total_stock || 0) - (variant.reserved_stock || 0);
                      return (
                        <TableRow key={variant.id}>
                          <TableCell>{variant.color || '-'}</TableCell>
                          <TableCell>{variant.size || '-'}</TableCell>
                          <TableCell>{variant.sku || '-'}</TableCell>
                          <TableCell>{formatCurrency(variant.price_adjustment || 0)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-20"
                              value={variant.total_stock || 0}
                              onChange={(e) => handleUpdateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{variant.reserved_stock || 0}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={availableStock <= 3 ? 'text-destructive font-medium' : ''}>
                                {availableStock}
                              </span>
                              {availableStock <= 3 && (
                                <Badge variant={availableStock === 0 ? 'destructive' : 'secondary'}>
                                  {availableStock === 0 ? 'Out' : 'Low'}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteVariant(variant.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {productVariants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No variants yet. Add size/color combinations above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                {/* Upload Button */}
                <Card>
                  <CardContent className="pt-6">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                        </p>
                      </div>
                    </Label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </CardContent>
                </Card>

                {/* Images Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.id} className={image.is_primary ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-2">
                        <div className="aspect-square rounded overflow-hidden mb-2">
                          <img src={image.url} alt={image.alt_text || ''} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant={image.is_primary ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSetPrimaryImage(image.id)}
                            disabled={image.is_primary}
                          >
                            {image.is_primary ? 'Primary' : 'Set Primary'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {images.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No images yet. Upload product images above.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = getProductStock(product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {totalStock}
                        {totalStock === 0 && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                        {totalStock > 0 && totalStock <= 3 && (
                          <Badge variant="secondary">Low Stock</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
