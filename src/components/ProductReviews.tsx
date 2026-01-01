import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  customer: { full_name: string | null } | null;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        id, rating, title, comment, created_at,
        customer:customers(full_name)
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (!error) {
      setReviews((data || []) as Review[]);
    }

    // Check if user has already reviewed
    if (user) {
      const { data: userReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('customer_id', user.id)
        .maybeSingle();
      
      setUserHasReviewed(!!userReview);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        customer_id: user.id,
        rating,
        title: title || null,
        comment: comment || null,
      });

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Review submitted successfully!');
      setShowForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      fetchReviews();
    }
    setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const renderStars = (count: number, size = 'h-4 w-4') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= count ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl tracking-wider mb-2">Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              {renderStars(Math.round(averageRating), 'h-5 w-5')}
              <span className="text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        
        {user && !userHasReviewed && !showForm && (
          <Button variant="glass-gold" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-secondary/30 rounded-lg space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'fill-primary text-primary' 
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Review Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              className="bg-background/50"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">Your Review (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
              className="bg-background/50"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="glass-gold" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-white/10 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{review.customer?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.title && (
                <h4 className="font-medium mb-1">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
