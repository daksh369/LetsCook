import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  recipes_count: number;
  dietary_preferences: string[];
  favorite_cuisines: string[];
  allergies: string[];
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.uid);
      setUser(user);
      
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as UserProfile;
        console.log('✅ Profile loaded:', profileData.name);
        setProfile(profileData);
      } else {
        console.log('❌ No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
      console.log('📝 Creating new user:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create profile document
      const profileData: UserProfile = {
        id: user.uid,
        email,
        name,
        username,
        bio: '',
        followers_count: 0,
        following_count: 0,
        recipes_count: 0,
        dietary_preferences: [],
        favorite_cuisines: [],
        allergies: [],
        skill_level: 'Beginner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'profiles', user.uid), profileData);
      console.log('✅ Profile created for:', name);
      setProfile(profileData);

      return { error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user');
      await firebaseSignOut(auth);
      setProfile(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: new Error('No user logged in') };

    try {
      console.log('📝 Updating profile:', updates);
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      await updateDoc(doc(db, 'profiles', user.uid), updatedProfile);
      setProfile(updatedProfile);
      console.log('✅ Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};