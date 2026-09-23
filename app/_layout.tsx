import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, SplashScreen, Stack, ThemeProvider, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setBackdrop, setPageBackground } from '@/lib/webChrome';
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

/**
 * Edge colors of the photos under their overlays, sampled from the images. Safari
 * fills its status bar and toolbar with a flat page color, so matching the photo's
 * top and bottom edges makes the bars read as part of the picture.
 */
const LANDING_EDGES = { top: '#3B4B61', bottom: '#27313D' }; // landing-mobile.jpg at 36%, 40% overlay
const LEARN_TOP = '#4F443B'; // cedar.jpg, 60% overlay

/** The page color Safari shows above and below each screen on iPhone. */
function pageFor(pathname: string): [background: string, themeColor: string] {
  const dark = colors.dark.bg;
  if (pathname === '/') return [`linear-gradient(${LANDING_EDGES.top} 50%, ${LANDING_EDGES.bottom} 50%)`, LANDING_EDGES.top];
  if (pathname.startsWith('/onboarding') || pathname === '/id-failed') return [dark, dark];
  // Photo header on top, white page below.
  if (pathname === '/learn') return [`linear-gradient(${LEARN_TOP} 50%, ${colors.light.bg} 50%)`, LEARN_TOP];
  if (pathname === '/host') return ['#FAFAF9', '#FAFAF9'];
  return [colors.light.bg, colors.light.bg];
}

function WebPageChrome() {
  const pathname = usePathname();
  useEffect(() => {
    setPageBackground(...pageFor(pathname));
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
            <Stack.Screen name="host" options={{ contentStyle: { backgroundColor: '#FAFAF9' } }} />
            <Stack.Screen name="confirmed/[id]" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="id-failed" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.dark.bg } }} />
          </Stack>
        </BottomSheetModalProvider>
        </ThemeProvider>
      </WebFrame>
    </GestureHandlerRootView>
  );
}
