
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type UserRole = 
  | 'admin'
  | 'project_manager'
  | 'data_entry'
  | 'production_engineer'
  | 'qc_factory'
  | 'store_site'
  | 'qc_site'
  | 'foreman_site'
  | 'site_engineer';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
          
          // Update last_sign_in_at in profiles table
          // Use setTimeout to prevent blocking the auth state change
          if (session?.user) {
            setTimeout(async () => {
              try {
                const currentTime = new Date().toISOString();
                
                // Use the typed definition to ensure we're only passing valid fields
                const updateData = {
                  updated_at: currentTime,
                  last_sign_in_at: currentTime
                };
                
                const { error } = await supabase
                  .from('profiles')
                  .update(updateData)
                  .eq('id', session.user.id);
                  
                if (error) {
                  console.error("Error updating last sign in time:", error);
                }
              } catch (error) {
                console.error("Error in updating last sign in:", error);
              }
            }, 0);
          }
          
          fetchUserRole(session?.user?.id);
        }
        if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchUserRole(session?.user?.id);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user role:", error);
      } else if (data) {
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("Error in role fetch:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
