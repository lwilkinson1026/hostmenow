import { router, useLocalSearchParams } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CaptureStep } from '@/components/Capture';
import { colors } from '@/theme';

/** Rounded rectangle guide with corner brackets, dimming everything outside it. */
function IdGuide({ w }: { w: number }) {
  const h = Math.round(w * 0.632);
  const r = 16;
  const a = 44;
  return (
    <View style={{ width: w, height: h, borderRadius: r, backgroundColor: 'rgba(245,245,244,0.04)', boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)' }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke={colors.dark.ink} strokeWidth={3} strokeLinecap="round">
        <Path d={`M2 ${a}V${r + 2}a${r} ${r} 0 0 1 ${r} -${r}H${a}`} />
        <Path d={`M${w - a} 2H${w - r - 2}a${r} ${r} 0 0 1 ${r} ${r}V${a}`} />
        <Path d={`M${w - 2} ${h - a}V${h - r - 2}a${r} ${r} 0 0 1 -${r} ${r}H${w - a}`} />
        <Path d={`M${a} ${h - 2}H${r + 2}a${r} ${r} 0 0 1 -${r} -${r}V${h - a}`} />
      </Svg>
    </View>
  );
}

/** B3a. Your ID. */
export default function IdScan() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { width } = useWindowDimensions();
  return (
    <CaptureStep
      kind="id"
      title="Your ID."
      guide={<IdGuide w={Math.min(width, 430) - 48} />}
      guideLabel="Capture ID"
      guideTop={170}
      hint="Driver's license or passport. We never share it."
      status="Hold steady. It captures on its own."
      onCaptured={() => router.push(mode ? { pathname: '/onboarding/selfie', params: { mode } } : '/onboarding/selfie')}
    />
  );
}
