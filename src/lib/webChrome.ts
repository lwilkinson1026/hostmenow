import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

import { INTRO } from './intro';

/**
 * Web only: the page behind the app. Safari on iPhone shows the page background
 * above and below the app (status bar and toolbar), so each screen sets it.
 * No-ops on native.
 */
const web = Platform.OS === 'web' && typeof document !== 'undefined';

/**
 * `color` must be a solid color: Safari tints its bars from the page's
 * background-color and falls back to white for gradients or images.
 */
export function setPageBackground(color: string, themeColor: string) {
  if (!web) return;
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
}

type Backdrop = {
  source: number;
  cropX?: number;
  overlay: number;
  /** Lights-off version of the same shot, for the intro. */
  darkSource?: number;
};

const setImg = (img: HTMLImageElement | null, source: number | undefined, cropX: number) => {
  if (!img) return Promise.resolve();
  if (source === undefined) {
    img.removeAttribute('src');
    return Promise.resolve();
  }
  const uri = Asset.fromModule(source).uri;
  if (img.getAttribute('src') !== uri) img.setAttribute('src', uri);
  img.style.objectPosition = `${cropX}% 50%`;
  return img.decode().catch(() => undefined);
};

/**
 * Pin a drifting photo to the full screen behind the app, or remove it (null).
 * Resolves once the photos have loaded.
 */
export async function setBackdrop(photo: Backdrop | null): Promise<void> {
  if (!web) return;
  const el = document.getElementById('backdrop');
  if (!el) return;
  if (!photo) {
    el.classList.remove('on');
    return;
  }
  el.style.setProperty('--rest', String(photo.overlay));
  const cropX = photo.cropX ?? 50;
  el.classList.add('on');
  await Promise.all([
    setImg(el.querySelector<HTMLImageElement>('img.lit'), photo.source, cropX),
    setImg(el.querySelector<HTMLImageElement>('img.dark'), photo.darkSource, cropX),
  ]);
}

/**
 * Web half of the landing intro. 'dark' holds the lights-off start, 'play' runs it,
 * 'skip' jumps to the end quickly, 'done' shows the end state with no motion.
 */
export function backdropIntro(state: 'dark' | 'play' | 'skip' | 'done') {
  if (!web) return;
  const el = document.getElementById('backdrop');
  if (!el) return;
  el.style.setProperty('--dark', String(INTRO.darkOverlay));
  if (state === 'done') {
    el.classList.remove('intro', 'lit', 'fast');
    return;
  }
  el.classList.add('intro');
  el.classList.toggle('lit', state !== 'dark');
  el.classList.toggle('fast', state === 'skip');
}

export const hasWebBackdrop = web;
