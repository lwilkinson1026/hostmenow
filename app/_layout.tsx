import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, SplashScreen, Stack, ThemeProvider, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { pageColorsFor, setBackdrop, setPageBackground } from '@/lib/webChrome';
import { colors, motion } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** On web, everything but the public pages renders as the mobile layout, centered. */
const FULL_WIDTH = ['/', '/learn'];
function WebFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (Platform.OS !== 'web' || FULL_WIDTH.includes(pathname)) return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bgSubtle, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

/** Screens paint their own backgrounds; the navigator's default grey would hide the web backdrop. */
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent' } };

function WebPageChrome() {
  const pathname = usePathname();
  useEffect(() => {
    // Learn More and /hosts set their own colors (dark during their intros).
    if (pathname !== '/learn' && pathname !== '/hosts') setPageBackground(...pageColorsFor(pathname));
    if (pathname !== '/') setBackdrop(null);
  }, [pathname]);
  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_600SemiBold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.dark.bg }}>
      <WebPageChrome />
      <WebFrame>
        <ThemeProvider value={navTheme}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: motion.step.duration,
              contentStyle: { backgroundColor: colors.light.bg },
            }}
          >
            <Stack.Screen
              name="index"
              // On web the landing photo sits behind the app (see lib/webChrome), so the screen is see-through.
              options={{ animation: 'fade', contentStyle: { backgroundColor: Platform.OS === 'web' ? 'transparent' : colors.dark.bg } }}
            />
            <Stack.Screen name="onboarding" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.dark.bg } }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 500, gestureEnabled: false }} />
            <Stack.Screen name="preview/hostshare" options={{ contentStyle: { backgroundColor: '#FAFAF9' } }} />
            <Stack.Screen name="confirmed/[id]" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="id-failed" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.dark.bg } }} />
          </Stack>
        </BottomSheetModalProvider>
        </ThemeProvider>
      </WebFrame>
    </GestureHandlerRootView>
  );
}
