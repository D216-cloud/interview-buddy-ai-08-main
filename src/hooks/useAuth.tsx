import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as db from "@/integrations/supabase/database";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const ensureUserProfile = async (userId: string, email: string, fullName?: string) => {
      try {
        // Check if profile exists
        const profile = await db.getUserProfile(userId);
        if (!profile && isMounted) {
          // Profile doesn't exist, create it
          await db.createUserProfile(userId, fullName || "User", email);
        }
      } catch (error) {
        console.error("Error ensuring user profile:", error);
      }
    };

    const initAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
            
            // Ensure profile exists when user changes
            if (session?.user?.id) {
              ensureUserProfile(
                session.user.id,
                session.user.email || "",
                session.user.user_metadata?.full_name
              );
            }
          }
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
          
          // Ensure profile exists for current session
          if (session?.user?.id) {
            await ensureUserProfile(
              session.user.id,
              session.user.email || "",
              session.user.user_metadata?.full_name
            );
          }
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Timeout after 5 seconds to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 5000);

    initAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
