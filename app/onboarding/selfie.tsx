import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { CaptureStep } from '@/components/Capture';
import { identity } from '@/services';
import { useApp } from '@/store/app';
import { colors } from '@/theme';

/** B3b. Now you. After capture, the check runs in the background. */
export default function Selfie() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const setIdStatus = useApp((s) => s.setIdStatus);
  return (
    <CaptureStep
      kind="selfie"
      title="Now you."
      guide={
        <View
          style={{ width: 260, height: 260, borderRadius: 130, borderWidth: 2, borderColor: colors.dark.ink, boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)' }}
        />
      }
      guideLabel="Capture selfie"
      guideTop={124}
      hint="Look straight ahead."
      status="It captures on its own."
      onCaptured={() => {
        setIdStatus('verifying');
        identity.checkStatus(9000).then((s) => {
          if (useApp.getState().idStatus === 'verifying') setIdStatus(s);
        });
        if (mode === 'retry') router.dismissTo('/explore');
        else router.push('/onboarding/house-rules');
      }}
    />
  );
}
