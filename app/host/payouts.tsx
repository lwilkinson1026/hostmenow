import { router } from 'expo-router';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { HostButton, HostStep, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { host } from '@/data/host';
import { useHost } from '@/store/host';
import { type } from '@/theme';

function Field({ value, onChange, placeholder, numeric, secure }: { value: string; onChange: (t: string) => void; placeholder: string; numeric?: boolean; secure?: boolean }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      accessibilityLabel={placeholder}
      placeholderTextColor={hs.tertiary}
      keyboardType={numeric ? 'number-pad' : 'default'}
      secureTextEntry={secure}
      autoCorrect={false}
      autoComplete="off"
      style={[type.body, styles.input]}
    />
  );
}

/** 5. Confirm the existing payout account; W-9 only if none on file. */
export default function Payouts() {
  const { w9, setW9, w9OnFile } = useHost();
  const complete = w9OnFile || (w9.legal.trim() && w9.tin.replace(/\D/g, '').length === 9 && w9.address.trim());
  return (
    <HostStep progress={4 / 6} actions={<HostButton label="Continue" disabled={!complete} onPress={() => router.push('/host/terms')} />}>
      <T variant="title" style={{ marginTop: 28, marginBottom: 4 }}>Where earnings go.</T>
      <T variant="callout" color="inkSecondary">Paid stays arrive with your Hostshare payouts. Pool shares arrive each quarter.</T>
      <View style={styles.account}>
        <HostIcon name="bank" />
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bodyStrong">{host.payoutAccount}</T>
          <T variant="caption" color="inkSecondary">Your Hostshare payout account</T>
        </View>
        <T variant="calloutStrong" style={{ paddingVertical: 10 }}>Change</T>
      </View>
      {w9OnFile ? null : (
        <View style={{ marginTop: 28, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T variant="bodyStrong">Tax info</T>
            <T variant="captionStrong" style={{ color: hs.accentText }}>Needed once</T>
          </View>
          <T variant="caption" color="inkSecondary" style={{ marginTop: -6 }}>Pool payouts are reported on a 1099. This fills in your W-9.</T>
          <Field value={w9.legal} onChange={(legal) => setW9({ legal })} placeholder="Legal name or business name" />
          <Field value={w9.tin} onChange={(tin) => setW9({ tin: tin.replace(/[^\d-]/g, '').slice(0, 11) })} placeholder="SSN or EIN" numeric secure />
          <Field value={w9.address} onChange={(address) => setW9({ address })} placeholder="Mailing address" />
          <T variant="caption" color="inkSecondary" style={{ fontSize: 12, lineHeight: 17 }}>
            Skipped for hosts whose W-9 is already on file with Hostshare.
          </T>
        </View>
      )}
    </HostStep>
  );
}

const styles = StyleSheet.create({
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 24, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 1, borderColor: hs.line, borderRadius: 16 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: hs.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: hs.ink,
    backgroundColor: hs.card,
    ...(Platform.OS === 'web' ? ({ outlineColor: hs.accent } as object) : null),
  },
});
