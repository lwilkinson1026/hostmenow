import { router, usePathname } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DESKTOP_GUTTER, DESKTOP_NAV_HEIGHT } from '@/lib/layout';
import { haptics } from '@/services';
import { useBankedNights } from '@/store/app';
import { colors } from '@/theme';
import { DevMenu } from './DevMenu';
import { NightsPill } from './NightsPill';
import type { SheetRef } from './Sheet';
import { T, Wordmark } from './Text';

const tabs = [
  { href: '/explore', label: 'Explore' },
  { href: '/trips', label: 'Trips' },
  { href: '/you', label: 'You' },
] as const;

/** Desktop: the three tabs move to a top bar with the wordmark and the nights pill. Hairline, no tint. */
export function DesktopNav() {
  const pathname = usePathname();
  const nights = useBankedNights();
  const devMenu = useRef<SheetRef>(null);
  const current = pathname.startsWith('/trip')
    ? '/trips'
    : ['/nights', '/invites', '/membership', '/rules', '/agent'].includes(pathname)
      ? '/you'
      : pathname;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.side}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="hostmenow, Explore"
            delayLongPress={600}
            onPress={() => router.navigate('/explore')}
            onLongPress={() => {
              haptics.tapLight();
              devMenu.current?.present();
            }}
          >
            <Wordmark size={22} />
          </Pressable>
        </View>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map((t) => {
            const on = current === t.href;
            return (
              <Pressable
                key={t.href}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => router.navigate(t.href)}
                style={({ hovered }: { hovered?: boolean }) => [styles.tab, hovered && !on ? { backgroundColor: colors.light.bgSubtle } : null]}
              >
                <T variant={on ? 'calloutStrong' : 'callout'} color={on ? 'ink' : 'inkSecondary'}>
                  {t.label}
                </T>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          {/* The confirmed screen animates its own pill from the old count to the new. */}
          {pathname.startsWith('/confirmed/') ? null : <NightsPill count={nights} />}
        </View>
      </View>
      <DevMenu ref={devMenu} onClose={() => devMenu.current?.dismiss()} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'stretch',
    height: DESKTOP_NAV_HEIGHT,
    backgroundColor: colors.light.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
    justifyContent: 'center',
    zIndex: 5,
  },
  inner: { width: '100%', paddingHorizontal: DESKTOP_GUTTER, flexDirection: 'row', alignItems: 'center' },
  // Two equal sides keep the tabs centered in the bar without anything overlapping them.
  side: { flex: 1, flexBasis: 0, alignItems: 'flex-start' },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: { height: 40, paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center' },
});
