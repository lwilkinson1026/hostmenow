import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { EstimateFlow } from '@/components/host/EstimateFlow';
import { referralCodes } from '@/data/mock';
import { HostsPrelude } from '@/components/host/HostsPrelude';
import { pageColorsFor, setPageBackground } from '@/lib/webChrome';
import { colors } from '@/theme';

/** hostmenow.com/hosts: a short typed intro, then the three-question host estimate (Revision 02). */
export default function Hosts() {
  // The intro plays each time the page opens (not for Reduce Motion).
  const reduceMotion = useReducedMotion();
  const [prelude, setPrelude] = useState(!reduceMotion);
  const endPrelude = useCallback(() => setPrelude(false), []);
  // A member's host link carries ?ref=; the host who joins opens a seat for them.
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const referredBy = ref ? referralCodes[ref.toLowerCase()] : undefined;
  // Keep Safari's bars dark while the intro plays, then match the page.
  useEffect(() => {
    if (prelude) setPageBackground(colors.dark.bg, colors.dark.bg);
    else setPageBackground(...pageColorsFor('/hosts'));
  }, [prelude]);

  return (
    <View style={{ flex: 1 }}>
      {/* Opting in happens inside Hostshare; signed-out hosts sign in there first. */}
      <EstimateFlow revealed={!prelude} referredBy={referredBy} onCta={() => Linking.openURL('https://hostshare.co')} />
      {prelude ? <HostsPrelude onDone={endPrelude} /> : null}
    </View>
  );
}
