import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useInsets } from '@/lib/insets';
import { DESKTOP_GUTTER, DESKTOP_NAV_HEIGHT, useDesktop } from '@/lib/layout';

import { DevMenu } from '@/components/DevMenu';
import { ExploreMap } from '@/components/ExploreMap';
import { Icon } from '@/components/Icon';
import { ListingCard } from '@/components/ListingCard';
import { Reveal } from '@/components/Reveal';
import { WatchToast } from '@/components/WatchToast';
import { MapCard } from '@/components/MapCard';
import { NightsPill } from '@/components/NightsPill';
import { PressScale } from '@/components/PressScale';
import { RangeChips } from '@/components/RangeChips';
import { Segmented } from '@/components/Segmented';
import type { SheetRef } from '@/components/Sheet';
import { T, Wordmark } from '@/components/Text';
import { freeNightsAt, listings, member, type Listing } from '@/data/mock';
import { addDays, plural, shortDay, today } from '@/lib/dates';
import { nightsIn, rangeOpen } from '@/lib/range';
import { byTravel } from '@/lib/travel';
import { haptics } from '@/services';
import { useApp, useBankedNights, useFreeNights, useIsOpen } from '@/store/app';
import { colors, radius, type } from '@/theme';

/** Desktop grid: cards at least this wide, this far apart. */
const CARD_MIN = 220;
const GRID_GAP = 24;

/** C. Explore: list and map, with empty and paused states. On desktop, both at once. */
export default function Explore() {
  const insets = useInsets();
  const nights = useBankedNights();
  const usable = useFreeNights();
  const freeFor = (l: Listing) => freeNightsAt(l, usable) > 0;
  const isOpen = useIsOpen();
  const { range, setRange, exploreEmpty, membership } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(listings[0].id);
  const devMenu = useRef<SheetRef>(null);
  const desktop = useDesktop();
  const { width, height } = useWindowDimensions();

  const open = useMemo(() => {
    if (exploreEmpty) return [];
    const q = query.trim().toLowerCase();
    return byTravel(listings).filter((l) => {
      const open = range ? rangeOpen(range, (d) => isOpen(l, d)) : [1, 2, 3, 4, 5].some((d) => isOpen(l, d));
      return open && (!q || l.name.toLowerCase().includes(q) || l.region.toLowerCase().includes(q));
    });
  }, [exploreEmpty, query, range, isOpen]);

  const selected = open.find((l) => l.id === selectedId) ?? null;
  const openListing = (id: string) => router.push({ pathname: '/listing/[id]', params: { id } });

  const banner =
    membership === 'paused' ? (
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
    ) : null;

  const search = (
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
  );

  const chips = (
    <RangeChips value={range} onChange={setRange} rules={{ maxStart: 5, maxNights: 5, isOpen: () => true, allowClear: true }} />
  );

  const count = (
    <View style={{ flexShrink: 1 }}>
      <T variant="callout" color="inkSecondary">
        {open.length ? `${plural(open.length, 'home')} open · nearest to ${member.homeCity} first` : 'Nothing open'}
      </T>
      {range ? (
        <T variant="caption" color="inkSecondary">
          {plural(nightsIn(range), 'night')} · out {shortDay(addDays(today(), range.end + 1))}
        </T>
      ) : null}
    </View>
  );

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
      {banner}
      {search}
      {chips}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {count}
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

  if (desktop) {
    // Desktop: controls across the top, the card grid on the left, the map alongside it.
    const mapW = Math.min(Math.round(width * 0.4), 640);
    const listW = width - mapW;
    const cols = Math.max(1, Math.min(4, Math.floor((listW - DESKTOP_GUTTER * 2 + GRID_GAP) / (CARD_MIN + GRID_GAP))));
    const cardW = (listW - DESKTOP_GUTTER * 2 - GRID_GAP * (cols - 1)) / cols;
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.light.bg }}>
        <StatusBar style="dark" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ width: listW, flexGrow: 0 }}
          contentContainerStyle={{ paddingTop: 28, paddingHorizontal: DESKTOP_GUTTER, paddingBottom: 64, gap: 24 }}
        >
          {banner}
          <View style={styles.desktopControls}>
            <View style={{ flexGrow: 1, flexBasis: 260, maxWidth: 380 }}>{search}</View>
            <View style={{ width: 400 }}>{chips}</View>
          </View>
          {count}
          {open.length === 0 ? (
            empty
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: 40 }}>
              {open.map((l, i) => (
                <Reveal key={l.id} delay={Math.min(i, 8) * 80} style={{ width: cardW }}>
                  <ListingCard listing={l} free={freeFor(l)} onPress={() => openListing(l.id)} onHoverIn={() => setSelectedId(l.id)} />
                </Reveal>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={[styles.desktopMap, { width: mapW, height: height - DESKTOP_NAV_HEIGHT }]}>
          <ExploreMap listings={open} freeFor={freeFor} selectedId={selected?.id ?? null} onSelect={setSelectedId} isOpen={isOpen} />
          {selected ? (
            <View style={{ position: 'absolute', left: 20, right: 20, bottom: 20, alignItems: 'center' }}>
              <View style={{ width: '100%', maxWidth: 440 }}>
                <MapCard listing={selected} free={freeFor(selected)} isOpen={(d) => isOpen(selected, d)} onPress={() => openListing(selected.id)} />
              </View>
            </View>
          ) : null}
        </View>
        <WatchToast />
      </View>
    );
  }

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
              {open.map((l, i) => (
                <Reveal key={l.id} delay={Math.min(i, 4) * 90}>
                  <ListingCard listing={l} free={freeFor(l)} onPress={() => openListing(l.id)} />
                </Reveal>
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
              <ExploreMap listings={open} freeFor={freeFor} selectedId={selected?.id ?? null} onSelect={setSelectedId} isOpen={isOpen} />
              {selected ? (
                <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                  <MapCard listing={selected} free={freeFor(selected)} isOpen={(d) => isOpen(selected, d)} onPress={() => openListing(selected.id)} />
                </View>
              ) : null}
            </View>
          )}
        </View>
      )}
      <WatchToast />
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
  desktopControls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  desktopMap: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.light.line, overflow: 'hidden' },
  mapHeader: {
    backgroundColor: colors.light.bg,
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.line,
    zIndex: 1,
  },
});
