import { useCallback, useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { EstimateFlow } from '@/components/host/EstimateFlow';
import { HostsPrelude } from '@/components/host/HostsPrelude';
import { pageColorsFor, setPageBackground } from '@/lib/webChrome';
import { colors } from '@/theme';

/** hostmenow.com/hosts: a short typed intro, then the three-question host estimate (Revision 02). */
export default function Hosts() {
  // The intro plays each time the page opens (not for Reduce Motion).
  const reduceMotion = useReducedMotion();
  const [prelude, setPrelude] = useState(!reduceMotion);
  const endPrelude = useCallback(() => setPrelude(false), []);
  // Keep Safari's bars dark while the intro plays, then match the page.
  useEffect(() => {
    if (prelude) setPageBackground(colors.dark.bg, colors.dark.bg);
    else setPageBackground(...pageColorsFor('/hosts'));
  }, [prelude]);

  return (
    <View style={{ flex: 1 }}>
      {/* Opting in happens inside Hostshare; signed-out hosts sign in there first. */}
      <EstimateFlow revealed={!prelude} onCta={() => Linking.openURL('https://hostshare.co')} />
      {prelude ? <HostsPrelude onDone={endPrelude} /> : null}
    </View>
  );
}
