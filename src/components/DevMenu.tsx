import { router } from 'expo-router';
import { forwardRef } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { FREE_NIGHTS_UNLOCK_PREVIEW_DAYS, SEAT_RULES } from '@/config';
import { freeNightsOf, useApp } from '@/store/app';
import { colors } from '@/theme';
import { Segmented } from './Segmented';
import { Sheet, type SheetRef } from './Sheet';
import { T } from './Text';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <T>{label}</T>
      {children}
    </View>
  );
}

const track = { true: colors.light.ink, false: colors.light.line };

/** Hidden: long-press the wordmark on Explore. Switches mock states. */
export const DevMenu = forwardRef<SheetRef, { onClose: () => void }>(function DevMenu({ onClose }, ref) {
  const s = useApp();
  const nights = freeNightsOf(s.nightGrants);
  return (
    <Sheet ref={ref}>
      <T variant="heading" style={{ marginBottom: 4 }}>Prototype states</T>
      <T variant="caption" color="inkSecondary" style={{ marginBottom: 12 }}>Only in this build.</T>
      <Row label="Nights bank">
        <Segmented
          style={{ width: 120 }}
          options={[{ value: '5', label: '5' }, { value: '0', label: '0' }]}
          value={nights > 0 ? '5' : '0'}
          onChange={(v) => s.setFreeNights(v === '5' ? 5 : 0)}
        />
      </Row>
      <Row label={`Free nights locked ${FREE_NIGHTS_UNLOCK_PREVIEW_DAYS} days`}>
        <Switch
          trackColor={track}
          thumbColor="#FFFFFF"
          {...({ activeThumbColor: '#FFFFFF' } as object)}
          value={s.unlockDays > 0}
          onValueChange={(v) => s.setUnlockDays(v ? FREE_NIGHTS_UNLOCK_PREVIEW_DAYS : 0)}
        />
      </Row>
      <Row label="Membership paused">
        <Switch trackColor={track} thumbColor="#FFFFFF" {...({ activeThumbColor: '#FFFFFF' } as object)} value={s.membership === 'paused'} onValueChange={(v) => s.setMembership(v ? 'paused' : 'active')} />
      </Row>
      <Row label="ID">
        <Segmented
          style={{ width: 210 }}
          options={[
            { value: 'verified', label: 'OK' },
            { value: 'verifying', label: 'Checking' },
            { value: 'failed', label: 'Failed' },
          ]}
          value={s.idStatus}
          onChange={(v) => {
            s.setIdStatus(v);
            if (v === 'failed') {
              onClose();
              router.push('/id-failed');
            }
          }}
        />
      </Row>
      <Row label={`Hosts live ${SEAT_RULES.liveDaysToOpen} more days`}>
        <Switch
          trackColor={track}
          thumbColor="#FFFFFF"
          {...({ activeThumbColor: '#FFFFFF' } as object)}
          value={s.referralDaysAhead > 0}
          onValueChange={(v) => s.setReferralDaysAhead(v ? SEAT_RULES.liveDaysToOpen : 0)}
        />
      </Row>
      <Row label="Empty Explore">
        <Switch trackColor={track} thumbColor="#FFFFFF" {...({ activeThumbColor: '#FFFFFF' } as object)} value={s.exploreEmpty} onValueChange={s.setExploreEmpty} />
      </Row>
      <Row label="Empty Trips">
        <Switch trackColor={track} thumbColor="#FFFFFF" {...({ activeThumbColor: '#FFFFFF' } as object)} value={s.tripsEmpty} onValueChange={s.setTripsEmpty} />
      </Row>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.light.line,
  },
});
