import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, SplashScreen, Stack, ThemeProvider, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DesktopNav } from '@/components/DesktopNav';
import { isAppInterior, useDesktop } from '@/lib/layout';
import { pageColorsFor, setBackdrop, setPageBackground } from '@/lib/webChrome';
import { useApp } from '@/store/app';
import { colors, motion } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Web frame. Desktop members get the top nav over the app interior (the bottom tab
 * bar hides). The Hostshare preview stays phone-width: it shows how the opt-in
 * looks inside the Hostshare mobile app. The structure never changes shape, so the
 * navigator isn't remounted when the route changes.
 */
function WebFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const desktop = useDesktop();
  const isMember = useApp((s) => s.isMember);
  if (Platform.OS !== 'web') return <>{children}</>;
  const phone = pathname.startsWith('/preview/hostshare');
  const nav = desktop && isMember && isAppInterior(pathname);
  return (
    <View style={{ flex: 1, backgroundColor: phone ? colors.light.bgSubtle : 'transparent', alignItems: 'center' }}>
      {nav ? <DesktopNav /> : null}
      <View style={{ flex: 1, width: '100%', maxWidth: phone ? 480 : undefined, overflow: 'hidden' }}>{children}</View>
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
      <ThemeProvider value={navTheme}>
        <BottomSheetModalProvider>
          <WebFrame>
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
          </WebFrame>
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
