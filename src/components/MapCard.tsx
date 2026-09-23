import { Image } from 'expo-image';
import { View } from 'react-native';

import type { Listing } from '@/data/mock';
import { colors, radius, shadow } from '@/theme';
import { AvailabilityDots } from './AvailabilityDots';
import { PressScale } from './PressScale';
import { PriceLine } from './PriceLine';
import { T } from './Text';

/** Compact card at the bottom of the map for the selected marker. */
export function MapCard({ listing, free, isOpen, onPress }: { listing: Listing; free: boolean; isOpen: (day: number) => boolean; onPress: () => void }) {
  const cover = listing.photos[0];
  return (
    <PressScale
      accessibilityRole="link"
      accessibilityLabel={`${listing.name}, ${listing.region}`}
      onPress={onPress}
      style={[{ flexDirection: 'row', gap: 14, padding: 10, borderRadius: 16, backgroundColor: colors.light.bg }, shadow.sheet]}
    >
      <Image
        source={cover.src}
        contentFit="cover"
        contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
        style={{ width: 88, height: 88, borderRadius: radius.card }}
      />
      <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
        <T variant="bodyStrong" numberOfLines={1}>{listing.name}</T>
        <T variant="callout" color="inkSecondary">{listing.region}</T>
        <PriceLine listing={listing} free={free} />
        <View style={{ marginTop: 6 }}>
          <AvailabilityDots isOpen={isOpen} labels />
        </View>
      </View>
    </PressScale>
  );
}

/** Price marker with the next 5 days of availability above it. */
export function PricePill({ label, selected, isOpen }: { label: string; selected: boolean; isOpen: (day: number) => boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ paddingHorizontal: 5, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.92)' }}>
        <AvailabilityDots isOpen={isOpen} size={6} />
      </View>
      <View
        style={{
          height: 32,
          paddingHorizontal: 12,
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.light.ink : colors.light.bg,
          borderWidth: 0.5,
          borderColor: selected ? colors.light.ink : colors.light.line,
          justifyContent: 'center',
        }}
      >
        <T variant="calloutStrong" style={{ fontSize: 14, color: selected ? colors.light.onInk : colors.light.ink }}>{label}</T>
      </View>
    </View>
  );
}

export const pillLabel = (l: Listing, free: boolean) => (free ? 'Free' : `$${Math.round(l.retailNight / 2)}`);

export type ExploreMapProps = {
  listings: Listing[];
  free: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isOpen: (l: Listing, day: number) => boolean;
};
