import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/types';
import { fetchProfileByUserId } from '@/utils/supabase/crudProfile';
import { Session, User } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  refetchProfile: () => Promise<void>; // new refetch function
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAuthenticated: false,
  refetchProfile: async () => {}, // default no-op
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    const data = await fetchProfileByUserId(userId, userId);
    if (data) setProfile(data);
    else setProfile(null);
  };

  const refetchProfile = async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
    });

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        isAuthenticated: !!session?.user,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
