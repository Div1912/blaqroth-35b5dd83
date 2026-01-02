import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image, GripVertical } from 'lucide-react';

interface HeroSlide {
  id: string;
  media_url: string;
  media_type: string;
  headline: string;
  subheadline: string | null;
  primary_cta_text: string | null;
  primary_cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminHeroSlides = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState({
    media_url: '',
    media_type: 'image',
    headline: '',
    subheadline: '',
    primary_cta_text: '',
    primary_cta_link: '',
    secondary_cta_text: '',
    secondary_cta_link: '',
    display_order: 0,
    is_active: true,
  });

  const { data: slides, isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('hero_slides').insert({
        media_url: data.media_url,
        media_type: data.media_type,
        headline: data.headline,
        subheadline: data.subheadline || null,
        primary_cta_text: data.primary_cta_text || null,
        primary_cta_link: data.primary_cta_link || null,
        secondary_cta_text: data.secondary_cta_text || null,
        secondary_cta_link: data.secondary_cta_link || null,
        display_order: data.display_order,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Hero slide created');
      resetForm();
    },
    onError: () => toast.error('Failed to create slide'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof form }) => {
      const { error } = await supabase.from('hero_slides').update({
        media_url: data.media_url,
        media_type: data.media_type,
        headline: data.headline,
        subheadline: data.subheadline || null,
        primary_cta_text: data.primary_cta_text || null,
        primary_cta_link: data.primary_cta_link || null,
        secondary_cta_text: data.secondary_cta_text || null,
        secondary_cta_link: data.secondary_cta_link || null,
        display_order: data.display_order,
        is_active: data.is_active,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Hero slide updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update slide'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast.success('Hero slide deleted');
    },
    onError: () => toast.error('Failed to delete slide'),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('hero_slides').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] }),
    onError: () => toast.error('Failed to update status'),
  });

  const resetForm = () => {
    setForm({
      media_url: '',
      media_type: 'image',
      headline: '',
      subheadline: '',
      primary_cta_text: '',
      primary_cta_link: '',
      secondary_cta_text: '',
      secondary_cta_link: '',
      display_order: (slides?.length || 0) + 1,
      is_active: true,
    });
    setEditingSlide(null);
    setDialogOpen(false);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      media_url: slide.media_url,
      media_type: slide.media_type || 'image',
      headline: slide.headline,
      subheadline: slide.subheadline || '',
      primary_cta_text: slide.primary_cta_text || '',
      primary_cta_link: slide.primary_cta_link || '',
      secondary_cta_text: slide.secondary_cta_text || '',
      secondary_cta_link: slide.secondary_cta_link || '',
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.media_url.trim() || !form.headline.trim()) {
      toast.error('Media URL and headline are required');
      return;
    }
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hero Slides</h1>
          <p className="text-muted-foreground">Manage homepage hero carousel</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Slide</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'Edit' : 'Add'} Hero Slide</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Media *</Label>
                <ImageUpload
                  value={form.media_url}
                  onChange={(url) => setForm({ ...form, media_url: url })}
                  folder="hero-slides"
                />
                <p className="text-xs text-muted-foreground mt-1">Or paste a URL below</p>
                <Input
                  value={form.media_url}
                  onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Media Type</Label>
                  <Select value={form.media_type} onValueChange={(value) => setForm({ ...form, media_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div>
                <Label>Headline *</Label>
                <Input
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="Your headline here"
                />
              </div>
              <div>
                <Label>Subheadline</Label>
                <Input
                  value={form.subheadline}
                  onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
                  placeholder="Optional subheadline"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Primary CTA Text</Label>
                  <Input
                    value={form.primary_cta_text}
                    onChange={(e) => setForm({ ...form, primary_cta_text: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label>Primary CTA Link</Label>
                  <Input
                    value={form.primary_cta_link}
                    onChange={(e) => setForm({ ...form, primary_cta_link: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Secondary CTA Text</Label>
                  <Input
                    value={form.secondary_cta_text}
                    onChange={(e) => setForm({ ...form, secondary_cta_text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <Label>Secondary CTA Link</Label>
                  <Input
                    value={form.secondary_cta_link}
                    onChange={(e) => setForm({ ...form, secondary_cta_link: e.target.value })}
                    placeholder="/about"
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
                  {editingSlide ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : slides?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hero slides yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {slides?.map((slide) => (
            <Card key={slide.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {slide.media_type === 'video' ? (
                      <video src={slide.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={slide.media_url} alt={slide.headline} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{slide.headline}</p>
                    {slide.subheadline && (
                      <p className="text-sm text-muted-foreground truncate">{slide.subheadline}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Order: {slide.display_order} • {slide.media_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slide.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: slide.id, is_active: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this slide?')) {
                          deleteMutation.mutate(slide.id);
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

export default AdminHeroSlides;
