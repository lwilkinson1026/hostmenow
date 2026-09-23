import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Safe-area insets with a floor for the top edge, so layouts designed around the
 * iPhone status bar keep their rhythm on web and devices without a notch.
 */
export function useInsets() {
  const insets = useSafeAreaInsets();
  return { ...insets, top: Math.max(insets.top, 44) };
}
