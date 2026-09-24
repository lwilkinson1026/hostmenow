import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';

/**
 * Desktop web layout. Below this width (phones, narrow windows) every screen keeps
 * its mobile layout; at or above it, screens use the wider desktop layouts.
 */
export const DESKTOP_MIN = 900;

/** Widest the app interior content gets (listing, trips). The nav and Explore run full width. */
export const CONTENT_MAX = 1240;
/** Side padding on desktop. */
export const DESKTOP_GUTTER = 40;
/** Height of the desktop top nav, which replaces the bottom tab bar. */
export const DESKTOP_NAV_HEIGHT = 72;

export function useDesktop() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_MIN;
}

/**
 * A centered reading column on desktop (no-op on mobile). Use on a ScrollView's
 * content container or a screen's main View. Typical widths: 560 for single
 * questions and forms, 680 for lists and settings.
 */
export function useColumn(max = 680): ViewStyle {
  const desktop = useDesktop();
  return desktop ? { width: '100%', maxWidth: max, alignSelf: 'center' } : {};
}

/** Routes inside the member app. On desktop they sit under the top nav. */
export function isAppInterior(pathname: string) {
  return ['/explore', '/trips', '/you', '/nights', '/invites', '/membership', '/rules'].includes(pathname) ||
    ['/listing/', '/trip/', '/confirmed/'].some((p) => pathname.startsWith(p));
}
