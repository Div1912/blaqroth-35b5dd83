import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, MapPin, Check, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { addressSchema, formatZodErrors } from '@/lib/validationSchemas';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string | null;
  is_default: boolean | null;
}

interface AddressFormData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const emptyForm: AddressFormData = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
};

export function AddressManager() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false });

    if (error) {
      toast.error('Failed to load addresses');
      console.error(error);
    } else {
      setAddresses(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate form data
    const validationResult = addressSchema.safeParse(formData);
    
    if (!validationResult.success) {
      toast.error(formatZodErrors(validationResult.error));
      return;
    }
    
    setSaving(true);

    try {
      if (editingId) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            is_default: formData.is_default,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Address updated');
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            customer_id: user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || null,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            is_default: formData.is_default,
          });

        if (error) throw error;
        toast.success('Address added');
      }

      // If setting as default, update other addresses
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('customer_id', user.id)
          .neq('id', editingId || '');
      }

      resetForm();
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || 'India',
      is_default: address.is_default || false,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete address');
      console.error(error);
    } else {
      toast.success('Address deleted');
      fetchAddresses();
    }
  };

  const setAsDefault = async (id: string) => {
    if (!user) return;

    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', user.id);

    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to set default address');
    } else {
      toast.success('Default address updated');
      fetchAddresses();
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const fetchLocationAddress = async () => {
    // Check for HTTPS - geolocation requires secure context
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error('Location access requires HTTPS. Please use a secure connection.');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    // Check for permissions API support
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'denied') {
          toast.error('Location permission is blocked. Please enable it in your browser settings.');
          return;
        }
      } catch (e) {
        // Permissions API not fully supported, continue anyway
        console.log('[Location] Permissions API not available');
      }
    }

    setFetchingLocation(true);
    toast.info('Requesting location access...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('[Location] Coordinates received:', latitude, longitude);
        
        try {
          // Using OpenStreetMap's Nominatim API for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'BLAQROTH-Store/1.0'
              }
            }
          );
          
          if (!response.ok) {
            console.error('[Location] API response not ok:', response.status);
            throw new Error('Failed to fetch address');
          }
          
          const data = await response.json();
          console.log('[Location] Address data:', data);
          const address = data.address;
          
          setFormData(prev => ({
            ...prev,
            address_line1: [address.house_number, address.road].filter(Boolean).join(' ') || address.suburb || address.neighbourhood || '',
            address_line2: address.neighbourhood || address.suburb || '',
            city: address.city || address.town || address.village || address.county || address.state_district || '',
            state: address.state || '',
            postal_code: address.postcode || '',
            country: address.country || 'India',
          }));
          
          toast.success('Location fetched successfully! Please verify the address.');
        } catch (error) {
          console.error('[Location] Error fetching address:', error);
          toast.error('Failed to fetch address from location. Please enter manually.');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        setFetchingLocation(false);
        console.error('[Location] Geolocation error:', error.code, error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location access in your browser settings and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable. Please try again or enter address manually.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('An error occurred while fetching location. Please enter address manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider">Saved Addresses</h2>
        {!showForm && (
          <Button variant="glass-gold" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="glass-panel p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={fetchLocationAddress}
                disabled={fetchingLocation}
                className="flex items-center gap-2"
              >
                {fetchingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Use My Location
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">PIN Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-white/20"
              />
              <span className="text-sm">Set as default address</span>
            </label>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="glass" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {addresses.length === 0 && !showForm ? (
        <div className="glass-panel p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 relative"
            >
              {address.is_default && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                  Default
                </span>
              )}
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{address.full_name}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.state} - {address.postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.country}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                {!address.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setAsDefault(address.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Set Default
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
