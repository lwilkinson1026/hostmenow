import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useInsets } from '@/lib/insets';

import { DevMenu } from '@/components/DevMenu';
import { ExploreMap } from '@/components/ExploreMap';
import { Icon } from '@/components/Icon';
import { ListingCard } from '@/components/ListingCard';
import { MapCard } from '@/components/MapCard';
import { NightsPill } from '@/components/NightsPill';
import { PressScale } from '@/components/PressScale';
import { RangeChips } from '@/components/RangeChips';
import { Segmented } from '@/components/Segmented';
import type { SheetRef } from '@/components/Sheet';
import { T, Wordmark } from '@/components/Text';
import { listings } from '@/data/mock';
import { addDays, plural, shortDay, today } from '@/lib/dates';
import { nightsIn, rangeOpen } from '@/lib/range';
import { haptics } from '@/services';
import { useApp, useBankedNights, useFreeNights, useIsOpen } from '@/store/app';
import { colors, radius, type } from '@/theme';

/** C. Explore: list and map, with empty and paused states. */
export default function Explore() {
  const insets = useInsets();
  const nights = useBankedNights();
  const free = useFreeNights() > 0;
  const isOpen = useIsOpen();
  const { range, setRange, exploreEmpty, membership } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(listings[0].id);
  const devMenu = useRef<SheetRef>(null);

  const open = useMemo(() => {
    if (exploreEmpty) return [];
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      const open = range ? rangeOpen(range, (d) => isOpen(l, d)) : [1, 2, 3, 4, 5].some((d) => isOpen(l, d));
      return open && (!q || l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q));
    });
  }, [exploreEmpty, query, range, isOpen]);

  const selected = open.find((l) => l.id === selectedId) ?? null;
  const openListing = (id: string) => router.push({ pathname: '/listing/[id]', params: { id } });

  const header = (
    <View style={{ gap: 16 }}>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          accessible={false}
          delayLongPress={600}
          onLongPress={() => {
            haptics.tapLight();
            devMenu.current?.present();
          }}
        >
          <Wordmark size={22} />
        </Pressable>
        <NightsPill count={nights} />
      </View>

      {membership === 'paused' ? (
        <View style={styles.banner}>
          <T variant="callout" style={{ flex: 1 }}>
            {nights > 0
              ? `Your membership is paused. Your ${plural(nights, 'night')} ${nights === 1 ? 'is' : 'are'} safe.`
              : 'Your membership is paused.'}
          </T>
          <PressScale
            accessibilityRole="button"
            onPress={() => {
              haptics.tapLight();
              router.push({ pathname: '/onboarding/pay', params: { mode: 'resume' } });
            }}
            style={styles.resume}
          >
            <T variant="calloutStrong" color="onInk">Resume</T>
          </PressScale>
        </View>
      ) : null}

      <View style={styles.search}>
        <Icon name="search" size={20} color={colors.light.inkSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Where to?"
          placeholderTextColor={colors.light.inkSecondary}
          accessibilityLabel="Search destinations"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={[type.body, styles.searchInput]}
        />
      </View>

      <RangeChips value={range} onChange={setRange} rules={{ maxStart: 5, maxNights: 5, isOpen: () => true, allowClear: true }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexShrink: 1 }}>
          <T variant="callout" color="inkSecondary">{open.length ? `${plural(open.length, 'home')} open` : 'Nothing open'}</T>
          {range ? (
            <T variant="caption" color="inkSecondary">
              {plural(nightsIn(range), 'night')} · out {shortDay(addDays(today(), range.end + 1))}
            </T>
          ) : null}
        </View>
        <Segmented
          options={[
            { value: 'list', label: 'List' },
            { value: 'map', label: 'Map' },
          ]}
          value={view}
          onChange={setView}
        />
      </View>
    </View>
  );

  const empty = (
    <View style={{ paddingTop: 120, paddingHorizontal: 16, gap: 8 }}>
      {range && !exploreEmpty ? (
        <>
          <T variant="heading" align="center">Nothing open for those nights.</T>
          <T color="inkSecondary" align="center">Try a shorter stay or other days.</T>
        </>
      ) : (
        <>
          <T variant="heading" align="center">Nothing open nearby in the next 5 days.</T>
          <T color="inkSecondary" align="center">Check back tomorrow, homes open up daily.</T>
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.bg }}>
      <StatusBar style="dark" />
      {view === 'list' ? (
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top - 5, paddingHorizontal: 24, paddingBottom: 40, gap: 16 }}
        >
          {header}
          {open.length === 0 ? (
            empty
          ) : (
            <View style={{ gap: 40, paddingTop: 8 }}>
              {open.map((l) => (
                <ListingCard key={l.id} listing={l} free={free} onPress={() => openListing(l.id)} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={[styles.mapHeader, { paddingTop: insets.top - 5 }]}>{header}</View>
          {open.length === 0 ? (
            <View style={{ paddingHorizontal: 24 }}>{empty}</View>
          ) : (
            <View style={{ flex: 1 }}>
              <ExploreMap listings={open} free={free} selectedId={selected?.id ?? null} onSelect={setSelectedId} isOpen={isOpen} />
              {selected ? (
                <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                  <MapCard listing={selected} free={free} isOpen={(d) => isOpen(selected, d)} onPress={() => openListing(selected.id)} />
                </View>
              ) : null}
            </View>
          )}
        </View>
      )}
      <DevMenu ref={devMenu} onClose={() => devMenu.current?.dismiss()} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.light.bgSubtle,
  },
  resume: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.light.ink,
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.light.bgSubtle,
  },
  searchInput: { flex: 1, color: colors.light.ink, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
  mapHeader: {
    backgroundColor: colors.light.bg,
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
    zIndex: 1,
  },
});
