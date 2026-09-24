import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { HostButton, HostStep, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { hostTerms } from '@/data/host';
import { haptics, hostshare } from '@/services';
import { useHost } from '@/store/host';
import { BRAND } from '@/config';

/** 6. The short version. Agreeing gates the button. */
export default function Terms() {
  const { agreed, setAgreed, rows, w9, w9OnFile, optIn } = useHost();
  const [saving, setSaving] = useState(false);
  const live = rows.filter((r) => r.on);

  const submit = async () => {
    setSaving(true);
    await hostshare.optIn(
      live.map((r) => ({ listingId: r.id, level: r.mode })),
      w9OnFile ? undefined : w9,
    );
    haptics.success();
    optIn();
    setSaving(false);
    router.replace('/preview/hostshare/live');
  };

  return (
    <HostStep
      progress={5 / 6}
      actions={
        <View style={{ gap: 16 }}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => {
              haptics.tapLight();
              setAgreed(!agreed);
            }}
            style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}
          >
            <View style={[styles.box, agreed && { backgroundColor: hs.ink, borderColor: hs.ink }]}>
              {agreed ? <HostIcon name="check-bold" size={18} color="#FFFFFF" /> : null}
            </View>
            <T variant="callout" style={{ flex: 1, lineHeight: 21 }}>
              I agree to the {BRAND} Host Terms.{' '}
              <T
                variant="calloutStrong"
                accessibilityRole="link"
                onPress={() => router.push('/preview/hostshare/terms-full')}
                style={{ textDecorationLine: 'underline' }}
              >
                Read them in full
              </T>
            </T>
          </Pressable>
          <HostButton label={`Opt in ${live.length} ${live.length === 1 ? 'listing' : 'listings'}`} disabled={!agreed} loading={saving} onPress={submit} />
        </View>
      }
    >
      <T variant="title" style={{ marginTop: 28, marginBottom: 16 }}>The short version.</T>
      {hostTerms.map((t, i) => (
        <View key={t} style={[styles.item, i < hostTerms.length - 1 && styles.divider]}>
          <T variant="callout" color="inkSecondary" style={{ width: 16, fontVariant: ['tabular-nums'] }}>{i + 1}</T>
          <T variant="callout" style={{ flex: 1, lineHeight: 21 }}>{t}</T>
        </View>
      ))}
    </HostStep>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: 14, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: hs.tertiary, alignItems: 'center', justifyContent: 'center' },
});
