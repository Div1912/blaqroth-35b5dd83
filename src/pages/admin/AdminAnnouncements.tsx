import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  message: string;
  link: string | null;
  link_text: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    message: '',
    link: '',
    link_text: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('announcements').insert({
        message: data.message,
        link: data.link || null,
        link_text: data.link_text || null,
        is_active: data.is_active,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created');
      resetForm();
    },
    onError: () => toast.error('Failed to create announcement'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof form }) => {
      const { error } = await supabase.from('announcements').update({
        message: data.message,
        link: data.link || null,
        link_text: data.link_text || null,
        is_active: data.is_active,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement deleted');
    },
    onError: () => toast.error('Failed to delete announcement'),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('announcements').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
    onError: () => toast.error('Failed to update status'),
  });

  const resetForm = () => {
    setForm({ message: '', link: '', link_text: '', is_active: true, start_date: '', end_date: '' });
    setEditingAnnouncement(null);
    setDialogOpen(false);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      message: announcement.message,
      link: announcement.link || '',
      link_text: announcement.link_text || '',
      is_active: announcement.is_active,
      start_date: announcement.start_date ? new Date(announcement.start_date).toISOString().split('T')[0] : '',
      end_date: announcement.end_date ? new Date(announcement.end_date).toISOString().split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error('Message is required');
      return;
    }
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage announcement bar messages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'Edit' : 'Add'} Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Message *</Label>
                <Input
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter announcement message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
                <div>
                  <Label>Link Text</Label>
                  <Input
                    value={form.link_text}
                    onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
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
                  {editingAnnouncement ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : announcements?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements?.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{announcement.message}</p>
                    {announcement.link && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Link: {announcement.link} ({announcement.link_text || 'No text'})
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {announcement.start_date && (
                        <span>From: {format(new Date(announcement.start_date), 'MMM dd, yyyy')}</span>
                      )}
                      {announcement.end_date && (
                        <span>Until: {format(new Date(announcement.end_date), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.is_active}
                      onCheckedChange={(checked) => toggleActive.mutate({ id: announcement.id, is_active: checked })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this announcement?')) {
                          deleteMutation.mutate(announcement.id);
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

export default AdminAnnouncements;
