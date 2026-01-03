import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, phone?: string, phoneCountryCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] State changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Error getting session:', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName?: string, 
    phone?: string, 
    phoneCountryCode?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('[Auth] Attempting signup for:', email, 'with redirect:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          phone_country_code: phoneCountryCode || '+91',
        },
      },
    });

    if (error) {
      console.error('[Auth] Signup error:', error.message);
    } else {
      console.log('[Auth] Signup successful, confirmation email sent to:', email);
    }

    // If signup successful and we have additional data, update the customers table
    if (!error && data.user && (phone || fullName)) {
      // The trigger will create the customer record, but we need to update phone
      setTimeout(async () => {
        await supabase
          .from('customers')
          .update({
            phone: phone || null,
            phone_country_code: phoneCountryCode || '+91',
            full_name: fullName || null,
          })
          .eq('id', data.user!.id);
      }, 1000);
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Attempting signin for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[Auth] Signin error:', error.message);
    } else {
      console.log('[Auth] Signin successful');
    }
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] Attempting Google OAuth');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      console.error('[Auth] Google OAuth error:', error.message);
    }
    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset-password`;
    console.log('[Auth] Sending password reset email to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('[Auth] Password reset error:', error.message);
    } else {
      console.log('[Auth] Password reset email sent successfully');
    }
    
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    console.log('[Auth] Updating password');
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('[Auth] Password update error:', error.message);
    } else {
      console.log('[Auth] Password updated successfully');
    }
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    console.log('[Auth] Signing out');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
