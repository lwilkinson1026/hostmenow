import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HostIcon } from '@/components/host/HostIcon';
import { HostButton, HostSegmented, HostStep, HostSwitch, hs } from '@/components/host/HostUI';
import { T } from '@/components/Text';
import { hostListings } from '@/data/host';
import { hostshare } from '@/services';
import { listingEstimate, useHost, type OptInMode, type Row } from '@/store/host';

/** 3. Every live listing is on, paid and free stays, with a live estimate. Also "Manage" after opt-in. */
export default function Listings() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const manage = mode === 'manage';
  const store = useHost();
  // During opt-in, choices go straight to the store. When managing, edit a copy and only keep it on Save.
  const [draft, setDraft] = useState<Row[]>(store.rows);
  const rows = manage ? draft : store.rows;
  const toggle = (id: string) =>
    manage ? setDraft((d) => d.map((r) => (r.id === id ? { ...r, on: !r.on } : r))) : store.toggle(id);
  const setMode = (id: string, mode: OptInMode) =>
    manage ? setDraft((d) => d.map((r) => (r.id === id ? { ...r, mode } : r))) : store.setMode(id, mode);
  const [saving, setSaving] = useState(false);
  const live = rows.filter((r) => r.on);
  const total = live.reduce((s, r) => s + listingEstimate(r.id, r.mode), 0);

  const save = async () => {
    setSaving(true);
    await hostshare.saveListings(live.map((r) => ({ listingId: r.id, level: r.mode })));
    store.saveRows(draft);
    setSaving(false);
    router.back();
  };

  return (
    <HostStep
      progress={manage ? 1 : 2 / 6}
      actions={
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T variant="callout" color="inkSecondary">{live.length} {live.length === 1 ? 'listing' : 'listings'}</T>
            <T variant="calloutStrong">About ${total.toLocaleString('en-US')} a year</T>
          </View>
          {manage ? (
            <HostButton label="Save" loading={saving} onPress={save} />
          ) : (
            <HostButton label="Continue" disabled={live.length === 0} onPress={() => router.push('/host/guests')} />
          )}
        </>
      }
    >
      <T variant="title" style={{ marginTop: 28, marginBottom: 4 }}>{manage ? 'Your listings.' : 'Choose listings.'}</T>
      <T variant="callout" color="inkSecondary">
        {manage ? 'Turning one off stops new bookings. Stays already booked still happen.' : 'All your live listings are on. Change them any time.'}
      </T>
      <View style={{ marginTop: 16 }}>
        {hostListings.map((l) => {
          const row = rows.find((r) => r.id === l.id);
          if (!l.eligible || !row) {
            return (
              <View key={l.id} style={styles.row}>
                <View style={styles.head}>
                  <View style={[styles.thumb, { backgroundColor: hs.subtle }]} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="bodyStrong" color="inkTertiary">{l.name}</T>
                    <T variant="caption" color="inkSecondary">{l.reason}</T>
                  </View>
                  <HostSwitch label={`${l.name} unavailable`} value={false} disabled />
                </View>
              </View>
            );
          }
          const est = listingEstimate(l.id, row.mode);
          return (
            <View key={l.id} style={[styles.row, styles.divider]}>
              <View style={styles.head}>
                <View style={styles.thumb}>
                  <HostIcon name="house" color={hs.secondary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="bodyStrong">{l.name}</T>
                  <T variant="caption" color="inkSecondary">
                    {l.city} · ${l.rate} a night · about ${est.toLocaleString('en-US')} a year
                  </T>
                </View>
                <HostSwitch label={`Include ${l.name}`} value={row.on} onChange={() => toggle(l.id)} />
              </View>
              {row.on ? (
                <HostSegmented<OptInMode>
                  small
                  options={[
                    { value: 'both', label: 'Paid and free stays' },
                    { value: 'paid', label: 'Paid stays only' },
                  ]}
                  value={row.mode}
                  onChange={(m) => setMode(l.id, m)}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </HostStep>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingVertical: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: hs.line },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: hs.line, alignItems: 'center', justifyContent: 'center' },
});
