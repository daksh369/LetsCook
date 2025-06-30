import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

// Keep the splash screen visible while we check auth status
SplashScreen.preventAutoHideAsync();

// This component handles the navigation stack and auth guard
const NavigationStack = () => {
  // Activate the auth guard for the entire app
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="reviews/[id]" />
      <Stack.Screen name="share/[id]" />
      <Stack.Screen name="cooked/[id]" />
      <Stack.Screen name="user/[id]" />
      <Stack.Screen name="collections" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  useFrameworkReady();

  // Font loading
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationStack />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}