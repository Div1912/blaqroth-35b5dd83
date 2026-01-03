import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Edit2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailTemplate {
  id: string;
  template_type: string;
  name: string;
  subject: string;
  heading: string;
  message: string;
  cta_text: string | null;
  cta_link: string | null;
  color: string | null;
  is_active: boolean | null;
}

export default function AdminEmailTemplates() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: template.subject,
          heading: template.heading,
          message: template.message,
          cta_text: template.cta_text,
          cta_link: template.cta_link,
          color: template.color,
          is_active: template.is_active,
        })
        .eq('id', template.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated successfully');
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update template');
    },
  });

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'order_processing': 'Order Processing',
      'order_shipped': 'Order Shipped',
      'order_delivered': 'Order Delivered',
      'order_cancelled': 'Order Cancelled',
      'promotional_default': 'Promotional Email',
    };
    return labels[type] || type;
  };

  const getTemplateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'order_processing': '#f59e0b',
      'order_shipped': '#3b82f6',
      'order_delivered': '#22c55e',
      'order_cancelled': '#ef4444',
      'promotional_default': '#c9a962',
    };
    return colors[type] || '#6b7280';
  };

  const renderPreview = (template: EmailTemplate) => {
    const color = template.color || getTemplateTypeColor(template.template_type);
    return (
      <div className="bg-[#0a0a0a] p-4 rounded-lg">
        <div className="max-w-[400px] mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-lg border border-[#262626] overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-[#262626]">
            <h1 className="text-lg font-light tracking-[6px] text-primary">BLAQROTH</h1>
          </div>
          
          {/* Status Badge */}
          <div className="pt-4 text-center">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-xs tracking-wider uppercase"
              style={{ 
                backgroundColor: `${color}20`, 
                color: color,
                border: `1px solid ${color}40`
              }}
            >
              {template.template_type.replace('order_', '').replace('_', ' ')}
            </span>
          </div>
          
          {/* Content */}
          <div className="p-6 text-center">
            <h2 className="text-lg font-normal text-white mb-2">{template.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: template.message }} />
          </div>
          
          {/* Order Details Mock */}
          <div className="px-6 pb-4">
            <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Order Number</span>
                <span className="text-white">#ORD-12345</span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          {template.cta_text && (
            <div className="px-6 pb-6 text-center">
              <span 
                className="inline-block px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase text-black"
                style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
              >
                {template.cta_text}
              </span>
            </div>
          )}
          
          {/* Footer */}
          <div className="p-4 bg-[#0d0d0d] border-t border-[#262626] text-center">
            <p className="text-[10px] text-muted-foreground">© 2025 BLAQROTH. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Email Templates</h1>
          <p className="text-muted-foreground mt-2">Customize email templates for order status updates and promotions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['email-templates'] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: template.color || getTemplateTypeColor(template.template_type) }}
                />
                <div>
                  <h3 className="font-medium text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{getTemplateTypeLabel(template.template_type)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Subject: {template.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(template)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Template Type</label>
                <input
                  type="text"
                  value={getTemplateTypeLabel(editingTemplate.template_type)}
                  disabled
                  className="w-full bg-secondary/30 border border-white/10 rounded px-4 py-2 text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Subject Line</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Heading</label>
                <input
                  type="text"
                  value={editingTemplate.heading}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, heading: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Message (HTML supported)
                  <span className="text-xs ml-2 text-muted-foreground/70">
                    Variables: {'{{order_number}}'}, {'{{tracking_id}}'}, {'{{shipping_partner}}'}, {'{{customer_name}}'}
                  </span>
                </label>
                <textarea
                  value={editingTemplate.message}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                  rows={4}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Button Text</label>
                  <input
                    type="text"
                    value={editingTemplate.cta_text || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, cta_text: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Button Link</label>
                  <input
                    type="text"
                    value={editingTemplate.cta_link || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, cta_link: e.target.value })}
                    className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editingTemplate.color || '#c9a962'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingTemplate.color || '#c9a962'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, color: e.target.value })}
                    className="flex-1 bg-secondary/50 border border-white/10 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingTemplate.is_active ?? true}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm">Template is active</label>
              </div>

              {/* Live Preview */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Preview</label>
                {renderPreview(editingTemplate)}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="hero"
                  onClick={() => updateMutation.mutate(editingTemplate)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && renderPreview(previewTemplate)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
