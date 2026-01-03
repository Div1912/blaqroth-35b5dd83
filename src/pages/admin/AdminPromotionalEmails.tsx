import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function AdminPromotionalEmails() {
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [message, setMessage] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('https://blaqroth.site/shop');
  const [sending, setSending] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Fetch customers for selection
  const { data: customers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, email, full_name')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSend = async () => {
    if (!subject || !heading || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('You must be logged in');
        return;
      }

      const response = await supabase.functions.invoke('send-promotional-email', {
        body: {
          subject,
          heading,
          message,
          ctaText: ctaText || undefined,
          ctaLink: ctaLink || undefined,
          recipientEmails: sendToAll ? undefined : selectedEmails,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      toast.success(`Email sent to ${result.success} recipients!`);
      
      // Reset form
      setSubject('');
      setHeading('');
      setMessage('');
      setCtaText('Shop Now');
      setCtaLink('https://blaqroth.site/shop');
      setSelectedEmails([]);
    } catch (error: any) {
      console.error('Error sending promotional email:', error);
      toast.error(error.message || 'Failed to send promotional email');
    } finally {
      setSending(false);
    }
  };

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Promotional Emails</h1>
          <p className="text-muted-foreground mt-2">Send promotional emails to your customers</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span>{customers?.length || 0} customers</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 space-y-6"
      >
        {/* Recipients Selection */}
        <div>
          <label className="text-sm text-muted-foreground block mb-3">Recipients</label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
                className="w-4 h-4"
              />
              <span>All Customers ({customers?.length || 0})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
                className="w-4 h-4"
              />
              <span>Select Specific</span>
            </label>
          </div>

          {!sendToAll && (
            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-lg p-3 space-y-2">
              {customers?.map(customer => (
                <label key={customer.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(customer.email)}
                    onChange={() => toggleEmail(customer.email)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{customer.full_name || customer.email}</span>
                  <span className="text-xs text-muted-foreground">{customer.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Subject Line *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., 🔥 New Collection Just Dropped!"
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Email Heading *</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g., Discover Our Latest Styles"
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground block mb-2">Message Content * (HTML supported)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Write your promotional message here. You can use basic HTML for formatting."
            className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Button Text</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Shop Now"
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Button Link</label>
            <input
              type="url"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="https://blaqroth.site/shop"
              className="w-full bg-secondary/50 border border-white/10 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Preview</label>
          <div className="border border-white/10 rounded-lg p-6 bg-black/50">
            <div className="text-center space-y-4">
              <h2 className="text-primary text-2xl tracking-widest">BLAQROTH</h2>
              <h3 className="text-xl text-foreground">{heading || 'Your Heading'}</h3>
              <div 
                className="text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: message || 'Your message content will appear here...' }}
              />
              {ctaText && (
                <Button variant="hero" size="lg" disabled className="mt-4">
                  {ctaText}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            variant="hero" 
            size="lg"
            onClick={handleSend}
            disabled={sending || !subject || !heading || !message || (!sendToAll && selectedEmails.length === 0)}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}