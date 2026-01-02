import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings, Truck, RotateCcw, Package, Save } from 'lucide-react';

interface ShippingConfigItem {
  id: string;
  config_key: string;
  config_value: string;
  description: string | null;
}

const AdminShippingSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    standard_delivery_days: '5-7',
    express_delivery_days: '2-3',
    return_window_days: '7',
    return_policy: 'Easy returns within 7 days of delivery',
    free_shipping_threshold: '2999',
    shipping_cost: '99',
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-shipping-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_config')
        .select('*');
      
      if (error) throw error;
      return data as ShippingConfigItem[];
    },
  });

  useEffect(() => {
    if (config) {
      const configMap: Record<string, string> = {};
      config.forEach(item => {
        configMap[item.config_key] = item.config_value;
      });
      setFormData({
        standard_delivery_days: configMap.standard_delivery_days || '5-7',
        express_delivery_days: configMap.express_delivery_days || '2-3',
        return_window_days: configMap.return_window_days || '7',
        return_policy: configMap.return_policy || 'Easy returns within 7 days of delivery',
        free_shipping_threshold: configMap.free_shipping_threshold || '2999',
        shipping_cost: configMap.shipping_cost || '99',
      });
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const updates = Object.entries(data).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        description: getDescription(key),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('shipping_config')
          .upsert(update, { onConflict: 'config_key' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-config'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
      toast.success('Shipping settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const getDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      standard_delivery_days: 'Standard delivery time range in days',
      express_delivery_days: 'Express delivery time range in days',
      return_window_days: 'Number of days for return eligibility',
      return_policy: 'Return policy message',
      free_shipping_threshold: 'Minimum order value for free shipping in INR',
      shipping_cost: 'Standard shipping cost in INR',
    };
    return descriptions[key] || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Shipping & Returns Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Settings
            </CardTitle>
            <CardDescription>Configure delivery time estimates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="standard_delivery_days">Standard Delivery Days</Label>
              <Input
                id="standard_delivery_days"
                value={formData.standard_delivery_days}
                onChange={(e) => setFormData({ ...formData, standard_delivery_days: e.target.value })}
                placeholder="e.g., 5-7"
              />
              <p className="text-xs text-muted-foreground">Format: min-max (e.g., 5-7)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="express_delivery_days">Express Delivery Days</Label>
              <Input
                id="express_delivery_days"
                value={formData.express_delivery_days}
                onChange={(e) => setFormData({ ...formData, express_delivery_days: e.target.value })}
                placeholder="e.g., 2-3"
              />
              <p className="text-xs text-muted-foreground">Format: min-max (e.g., 2-3)</p>
            </div>
          </CardContent>
        </Card>

        {/* Return Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Settings
            </CardTitle>
            <CardDescription>Configure return policy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return_window_days">Return Window (Days)</Label>
              <Input
                id="return_window_days"
                type="number"
                min="1"
                value={formData.return_window_days}
                onChange={(e) => setFormData({ ...formData, return_window_days: e.target.value })}
                placeholder="7"
              />
              <p className="text-xs text-muted-foreground">Number of days after delivery to allow returns</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_policy">Return Policy Message</Label>
              <Textarea
                id="return_policy"
                value={formData.return_policy}
                onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
                placeholder="Easy returns within 7 days of delivery"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Cost Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipping Cost Settings
            </CardTitle>
            <CardDescription>Configure shipping costs and free shipping threshold</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Shipping Cost (₹)</Label>
              <Input
                id="shipping_cost"
                type="number"
                min="0"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                placeholder="99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (₹)</Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value })}
                placeholder="2999"
              />
              <p className="text-xs text-muted-foreground">Orders above this amount get free shipping</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Button type="submit" disabled={updateMutation.isPending} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminShippingSettings;
