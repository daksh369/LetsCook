// app/_layout.tsx

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Keep the splash screen visible while we check auth status
SplashScreen.preventAutoHideAsync();

// This is the new component that will handle the redirection
const InitialLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      // If the user is signed in and not in the main app (tabs) group,
      // redirect them to the main app.
      console.log('User is signed in, redirecting to (tabs)');
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // If the user is not signed in and not in the auth group,
      // redirect them to the login screen.
      console.log('User is signed out, redirecting to login');
      router.replace('/(auth)/login');
    }

    // Hide the splash screen once we're done
    SplashScreen.hideAsync();

  }, [user, loading, segments, router]);

  // Render the main stack navigator
  // This navigator will render the correct group based on the URL,
  // and the useEffect above will handle redirecting to the correct URL.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};


export default function RootLayout() {
  // Font loading remains the same
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      // If fonts fail to load, we should still hide the splash screen
      // to avoid getting stuck.
      SplashScreen.hideAsync();
      console.error("Font loading error:", fontError);
    }
  }, [fontError]);

  // Don't render anything until the fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <InitialLayout />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}