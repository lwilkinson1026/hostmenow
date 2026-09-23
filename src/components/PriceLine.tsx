import { View } from 'react-native';

import type { Listing } from '@/data/mock';
import { money } from '@/lib/pricing';
import { T } from './Text';

/** "Free · cleaning $85" or "$220 $110 night" with the retail rate struck through. */
export function PriceLine({ listing, free }: { listing: Listing; free: boolean }) {
  if (free) {
    return (
      <T variant="callout" accessibilityLabel={`Free, cleaning ${money(listing.cleaning)}`}>
        <T variant="calloutStrong" color="accent">Free</T> · cleaning {money(listing.cleaning)}
      </T>
    );
  }
  const half = Math.round(listing.retailNight / 2);
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessible accessibilityLabel={`${money(half)} a night, was ${money(listing.retailNight)}`}>
      <T variant="callout" color="inkTertiary" style={{ textDecorationLine: 'line-through' }}>
        {money(listing.retailNight)}
      </T>
      <T variant="callout">
        <T variant="calloutStrong">{money(half)}</T> night
      </T>
    </View>
  );
}
