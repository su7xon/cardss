
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser?.email);
            setUser(currentUser);
            // Only set loading to false if we're not expecting a redirect result
            // though onAuthStateChanged usually fires after getRedirectResult
            setLoading(false);
        });

        // Check for redirect result on mount (essential for mobile in-app browsers)
        setLoading(true);
        getRedirectResult(auth).then((result) => {
            if (result) {
                console.log("Logged in via redirect successfully:", result.user.email);
            }
            setLoading(false);
        }).catch((error) => {
            console.error("Redirect login error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Try Popup first (Better UX for Desktop)
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Popup login failed, trying redirect...", error);
            // Fallback to Redirect (Essential for Mobile/In-App Browsers)
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError: any) {
                console.error("Redirect login also failed", redirectError);
                // User-friendly error
                alert(`Login Failed: ${redirectError.message || "Please try again or use a different browser."}`);
                throw redirectError;
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
