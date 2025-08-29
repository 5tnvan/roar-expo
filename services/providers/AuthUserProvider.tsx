import { supabase } from '@/lib/supabase';
import { fetchProfileByUserId } from '@/utils/supabase/crudProfile';
import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

type AuthUserContextType = {
    isLoading: boolean | null;
    profile: any;
};

const AuthUserContext = createContext<AuthUserContextType>({
    isLoading: null,
    profile: null,
});

export default function AuthUserProvider({ children }: PropsWithChildren) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any>();

    /**
     * SUPABASE CALL
     * Get user's session
     * **/
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    /**
     * SUPABASE CALL
     * Get authenticated user's profile
     * **/
    useEffect(() => {
        if (session) {
            setIsLoading(true);
            fetchProfileByUserId(session.user.id, session.user.id).then((data: any) => {
                setProfile(data);
            });
            setIsLoading(false);
        }
    }, [session])

    return (
        <AuthUserContext.Provider
            value={{
                isLoading,
                profile
            }}
        >
            {children}
        </AuthUserContext.Provider>
    );
}

export const useAuthUser = () => useContext(AuthUserContext);