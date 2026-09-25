import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { NavHeader } from '@/components/NavHeader';
import { Reveal } from '@/components/Reveal';
import { T } from '@/components/Text';
import { WatchButton } from '@/components/WatchButton';
import { listings } from '@/data/mock';
import { useInsets } from '@/lib/insets';
import { useColumn, useDesktop } from '@/lib/layout';
import { travelLabel } from '@/lib/travel';
import { watchStatus } from '@/lib/watch';
import { useApp, useIsOpen } from '@/store/app';
import { colors, radius } from '@/theme';

/** Homes the member is watching, and when each is next open. */
export default function Watching() {
  const insets = useInsets();
  const desktop = useDesktop();
  const column = useColumn(640);
  const watching = useApp((s) => s.watching);
  const isOpen = useIsOpen();
  const homes = listings.filter((l) => watching.includes(l.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[{ paddingTop: desktop ? 24 : insets.top - 5, paddingHorizontal: 24, paddingBottom: 48 }, column]}>
        <NavHeader />
        <T variant="display" style={{ marginTop: 32 }}>Watching.</T>
        <T color="inkSecondary" style={{ marginTop: 14 }}>We'll tell you when one of these opens within 5 days.</T>
        {homes.length === 0 ? (
          <T color="inkSecondary" style={{ marginTop: 40 }}>
            Tap the bookmark on any home to watch it.
          </T>
        ) : (
          <View style={styles.list}>
            {homes.map((l, i) => (
              <Reveal key={l.id} delay={i * 80}>
                <View style={styles.row}>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => router.push({ pathname: '/listing/[id]', params: { id: l.id } })}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}
                  >
                    <Image
                      source={l.photos[0].src}
                      contentFit="cover"
                      contentPosition={{ left: `${l.photos[0].cropX}%`, top: '50%' }}
                      style={{ width: 64, height: 80, borderRadius: radius.card }}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <T variant="bodyStrong">{l.name}</T>
                      <T variant="callout" color="inkSecondary">
                        {l.region} · {travelLabel(l.travel)}
                      </T>
                      <T variant="caption" color="inkSecondary">{watchStatus(l, isOpen)}</T>
                    </View>
                  </Pressable>
                  <WatchButton listingId={l.id} variant="circle" />
                </View>
              </Reveal>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 32, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.line },
});
