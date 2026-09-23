import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

/**
 * Web only: the page behind the app. Safari on iPhone shows the page background
 * above and below the app (status bar and toolbar), so each screen sets it.
 * No-ops on native.
 */
const web = Platform.OS === 'web' && typeof document !== 'undefined';

export function setPageBackground(background: string, themeColor: string) {
  if (!web) return;
  document.documentElement.style.background = background;
  document.body.style.background = background;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
}

/** Pin a drifting photo to the full screen behind the app, or remove it (null). */
export function setBackdrop(photo: { source: number; cropX?: number; overlay: number } | null) {
  if (!web) return;
  const el = document.getElementById('backdrop');
  if (!el) return;
  if (!photo) {
    el.classList.remove('on');
    return;
  }
  const img = el.querySelector('img');
  const shade = el.querySelector<HTMLDivElement>('.shade');
  const uri = Asset.fromModule(photo.source).uri;
  if (img && img.getAttribute('src') !== uri) img.setAttribute('src', uri);
  if (img) img.style.objectPosition = `${photo.cropX ?? 50}% 50%`;
  if (shade) shade.style.background = `rgba(0,0,0,${photo.overlay})`;
  el.classList.add('on');
}

export const hasWebBackdrop = web;
