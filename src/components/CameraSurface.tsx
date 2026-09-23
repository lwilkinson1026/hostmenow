import { CameraView, useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { RadialGradientBg } from './Gradient';

/** Simulators have no camera; the web prototype doesn't ask for one. */
const cameraAvailable = Platform.OS !== 'web' && Constants.isDevice;

/**
 * Full-bleed camera preview. Falls back to a static dark placeholder on simulator,
 * on web, or when permission is refused, so the flow always continues.
 */
export function CameraSurface({ facing }: { facing: 'front' | 'back' }) {
  const [permission, request] = useCameraPermissions();
  useEffect(() => {
    if (cameraAvailable && permission && !permission.granted && permission.canAskAgain) request();
  }, [permission, request]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <RadialGradientBg />
      {cameraAvailable && permission?.granted ? <CameraView style={StyleSheet.absoluteFill} facing={facing} mirror={facing === 'front'} /> : null}
    </View>
  );
}
