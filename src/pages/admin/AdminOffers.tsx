import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';
import { format } from 'date-fns';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applies_to: 'all' | 'products' | 'variants';
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

const AdminOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    applies_to: 'all' as 'all' | 'products' | 'variants',
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch offers');
    } else {
      setOffers((data || []) as Offer[]);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').eq('is_active', true);
    setProducts(data || []);
  };

  const fetchOfferProducts = async (offerId: string) => {
    const { data } = await supabase
      .from('offer_products')
      .select('product_id')
      .eq('offer_id', offerId);
    return data?.map(op => op.product_id) || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const offerData = {
      title: formData.title,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
      applies_to: formData.applies_to,
    };

    if (editingOffer) {
      const { error } = await supabase
        .from('offers')
        .update(offerData)
        .eq('id', editingOffer.id);

      if (error) {
        toast.error('Failed to update offer');
        return;
      }

      // Update product mappings if applies_to is products
      if (formData.applies_to === 'products') {
        await supabase.from('offer_products').delete().eq('offer_id', editingOffer.id);
        if (selectedProducts.length > 0) {
          await supabase.from('offer_products').insert(
            selectedProducts.map(productId => ({ offer_id: editingOffer.id, product_id: productId }))
          );
        }
      }

      toast.success('Offer updated successfully');
      setDialogOpen(false);
      fetchOffers();
    } else {
      const { data, error } = await supabase
        .from('offers')
        .insert([offerData])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create offer');
        return;
      }

      // Add product mappings
      if (formData.applies_to === 'products' && selectedProducts.length > 0) {
        await supabase.from('offer_products').insert(
          selectedProducts.map(productId => ({ offer_id: data.id, product_id: productId }))
        );
      }

      toast.success('Offer created successfully');
      setDialogOpen(false);
      fetchOffers();
    }
  };

  const handleEdit = async (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(),
      start_date: offer.start_date.split('T')[0],
      end_date: offer.end_date.split('T')[0],
      is_active: offer.is_active,
      applies_to: offer.applies_to,
    });
    
    if (offer.applies_to === 'products') {
      const productIds = await fetchOfferProducts(offer.id);
      setSelectedProducts(productIds);
    } else {
      setSelectedProducts([]);
    }
    
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    const { error } = await supabase.from('offers').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete offer');
    } else {
      toast.success('Offer deleted');
      fetchOffers();
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    const { error } = await supabase
      .from('offers')
      .update({ is_active: !offer.is_active })
      .eq('id', offer.id);

    if (error) {
      toast.error('Failed to update offer');
    } else {
      toast.success(offer.is_active ? 'Offer disabled' : 'Offer enabled');
      fetchOffers();
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: '',
      end_date: '',
      is_active: true,
      applies_to: 'all',
    });
    setSelectedProducts([]);
  };

  const isOfferExpired = (endDate: string) => new Date(endDate) < new Date();
  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    return offer.is_active && new Date(offer.start_date) <= now && new Date(offer.end_date) >= now;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Offers & Promotions</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., New Year Sale 20% OFF"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'flat') => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'} *
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applies To</Label>
                <Select
                  value={formData.applies_to}
                  onValueChange={(value: 'all' | 'products' | 'variants') => setFormData({ ...formData, applies_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="products">Selected Products</SelectItem>
                    <SelectItem value="variants">Selected Variants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.applies_to === 'products' && (
                <div className="space-y-2">
                  <Label>Select Products</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                        />
                        <span className="text-sm">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {offer.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {offer.discount_type === 'percentage' 
                      ? `${offer.discount_value}%`
                      : formatCurrency(offer.discount_value)
                    }
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(offer.start_date), 'MMM dd, yyyy')}</p>
                      <p className="text-muted-foreground">to {format(new Date(offer.end_date), 'MMM dd, yyyy')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {offer.applies_to === 'all' ? 'All Products' : 
                       offer.applies_to === 'products' ? 'Selected Products' : 'Selected Variants'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isOfferExpired(offer.end_date) ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : isOfferActive(offer) ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : offer.is_active ? (
                      <Badge variant="secondary">Scheduled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(offer)}
                      disabled={isOfferExpired(offer.end_date)}
                    >
                      {offer.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {offers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No offers found. Create your first promotion!
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

export default AdminOffers;
