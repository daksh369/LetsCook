import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (loading) {
      console.log('🔄 Auth state is loading, waiting...');
      return;
    }

    console.log('🔍 Auth guard checking:', { 
      user: user?.uid, 
      segments: segments.join('/'),
      loading 
    });

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)' || segments.length === 0;

    if (user && inAuthGroup) {
      // User is signed in but on auth pages (login/signup) - redirect to main app
      console.log('✅ User is signed in, redirecting from auth to (tabs)');
      router.replace('/(tabs)');
    } else if (!user && (inTabsGroup || segments[0] !== '(auth)')) {
      // User is not signed in but trying to access protected areas - redirect to login
      console.log('🔐 User is signed out, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments, router]);
}