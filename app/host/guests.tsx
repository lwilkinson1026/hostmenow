import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { HostButton, HostSegmented, HostStep, HostSwitch, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { memberVetting } from '@/data/host';
import { useHost } from '@/store/host';

/** 4. Who you'll host, booking mode, damage hold. */
export default function Guests() {
  const { booking, setBooking, damageHold, setDamageHold } = useHost();
  return (
    <HostStep progress={3 / 6} actions={<HostButton label="Continue" onPress={() => router.push('/host/payouts')} />}>
      <T variant="title" style={{ marginTop: 28, marginBottom: 4 }}>Who you'll host.</T>
      <T variant="callout" color="inkSecondary">Every member gets in the same way.</T>
      <View style={styles.box}>
        {memberVetting.map((v, i) => (
          <View key={v} style={[styles.item, i < memberVetting.length - 1 && styles.divider]}>
            <HostIcon name="check" size={20} />
            <T variant="callout" style={{ flex: 1 }}>{v}</T>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 28, gap: 10 }}>
        <T variant="bodyStrong">Booking</T>
        <HostSegmented
          options={[
            { value: 'instant', label: 'Instant book' },
            { value: 'approve', label: 'Approve requests' },
          ]}
          value={booking}
          onChange={setBooking}
        />
        <T variant="caption" color="inkSecondary">Same as your Hostshare setting. With a 5-day window, instant book gets more stays.</T>
      </View>
      <View style={styles.hold}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bodyStrong">Damage hold</T>
          <T variant="caption" color="inkSecondary">Hold an amount on the member's card during the stay.</T>
        </View>
        <HostSwitch label="Damage hold" value={damageHold} onChange={setDamageHold} />
      </View>
    </HostStep>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 16, backgroundColor: hs.subtle, borderRadius: 16, paddingVertical: 4, paddingHorizontal: 18 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
  hold: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: hs.line },
});
