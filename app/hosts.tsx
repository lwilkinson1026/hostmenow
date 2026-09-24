import { Linking } from 'react-native';

import { EstimateFlow } from '@/components/host/EstimateFlow';

/** hostmenow.com/hosts: the public three-question host estimate (Revision 02). */
export default function Hosts() {
  // Opting in happens inside Hostshare; signed-out hosts sign in there first.
  return <EstimateFlow onCta={() => Linking.openURL('https://hostshare.co')} />;
}
