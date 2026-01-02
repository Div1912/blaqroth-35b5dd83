import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, LayoutGrid, GripVertical } from 'lucide-react';

interface EditorialGridItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  display_order: number;
  is_active: boolean;
}

const AdminEditorialGrid = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditorialGridItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    display_order: 0,
    is_active: true,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-editorial-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editorial_grid_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as EditorialGridItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('editorial_grid_items').insert({
        title: data.title,
        subtitle: data.subtitle || null,
        image_url: data.image_url,
        link: data.link,
        display_order: data.display_order,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-editorial-grid'] });
      toast.success('Grid item created');
      resetForm();
    },
    onError: () => toast.error('Failed to create item'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof form }) => {
      const { error } = await supabase.from('editorial_grid_items').update({
        title: data.title,
        subtitle: data.subtitle || null,
        image_url: data.image_url,
        link: data.link,
        display_order: data.display_order,
        is_active: data.is_active,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-editorial-grid'] });
      toast.success('Grid item updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('editorial_grid_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-editorial-grid'] });
      toast.success('Grid item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('editorial_grid_items').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-editorial-grid'] }),
    onError: () => toast.error('Failed to update status'),
  });

  const resetForm = () => {
    setForm({ title: '', subtitle: '', image_url: '', link: '', display_order: (items?.length || 0) + 1, is_active: true });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openEdit = (item: EditorialGridItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      image_url: item.image_url,
      link: item.link,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url.trim() || !form.link.trim()) {
      toast.error('Title, image URL, and link are required');
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editorial Grid</h1>
          <p className="text-muted-foreground">Manage homepage editorial grid items</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Grid Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Item title"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <Label>Image URL *</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Link *</Label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : items?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No editorial grid items yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Link: {item.link} • Order: {item.display_order}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: item.id, is_active: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this item?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEditorialGrid;
