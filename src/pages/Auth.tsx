import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { countryCodes } from '@/lib/countryCodes';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    countryCode: '+91',
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/account');
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to sign in with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.phone, formData.countryCode);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Please check your email to verify your account.');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/account');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground scrollProgress={scrollProgress} />
      <Header />

      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            {/* Back Link */}
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <div className="glass-panel p-8 md:p-12">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground">
                  {mode === 'signin'
                    ? 'Sign in to access your account'
                    : 'Join BLAQROTH for a personalized experience'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="glass"
                size="lg"
                className="w-full mb-6"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-secondary/50 border border-white/10 rounded pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="w-28 bg-secondary/50 border border-white/10 rounded px-2 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-secondary/50 border border-white/10 rounded pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="9876543210"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-white/10 rounded pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-secondary/50 border border-white/10 rounded pl-10 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {mode === 'signin' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
