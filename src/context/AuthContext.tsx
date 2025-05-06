
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
        console.log("Auth state changed:", event, session?.user?.id);
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
                console.log(`Updating last_sign_in_at for user ${session.user.id} to ${currentTime}`);
                
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
                } else {
                  console.log("Successfully updated last_sign_in_at");
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
      console.log("Existing session check:", session?.user?.id);
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
      console.log(`Fetching role for user ${userId}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user role:", error);
      } else if (data) {
        console.log(`Role for user ${userId}:`, data.role);
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error("Error in role fetch:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Attempting to sign in user: ${email}`);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
      } else {
        console.log("Sign in successful");
      }
      
      return { error };
    } catch (error) {
      console.error("Exception during sign in:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log(`Attempting to sign up user: ${email}, ${fullName}`);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error("Sign up error:", error);
      } else {
        console.log("Sign up successful");
      }
      
      return { error };
    } catch (error) {
      console.error("Exception during sign up:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      console.log(`Attempting to reset password for: ${email}`);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Password reset error:", error);
      } else {
        console.log("Password reset email sent");
      }
      
      return { error };
    } catch (error) {
      console.error("Exception during password reset:", error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log("Updating user password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        console.error("Password update error:", error);
      } else {
        console.log("Password updated successfully");
      }
      
      return { error };
    } catch (error) {
      console.error("Exception during password update:", error);
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
