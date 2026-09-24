import { Image } from 'expo-image';
import { View } from 'react-native';

import type { Listing } from '@/data/mock';
import { radius } from '@/theme';
import { PressScale } from './PressScale';
import { PriceLine } from './PriceLine';
import { T } from './Text';

type Props = { listing: Listing; free: boolean; onPress: () => void; /** Desktop: pointer over the card (highlights its map pin). */ onHoverIn?: () => void };

/** 4:5 photo, radius 12. Name, region, price line. */
export function ListingCard({ listing, free, onPress, onHoverIn }: Props) {
  const cover = listing.photos[0];
  return (
    <PressScale
      accessibilityRole="link"
      accessibilityLabel={`${listing.name}, ${listing.region}`}
      onPress={onPress}
      onHoverIn={onHoverIn}
      scaleTo={0.985}
      style={{ gap: 12 }}
    >
      <Image
        source={cover.src}
        accessibilityLabel={cover.alt}
        contentFit="cover"
        contentPosition={{ left: `${cover.cropX}%`, top: '50%' }}
        transition={250}
        style={{ width: '100%', aspectRatio: 4 / 5, borderRadius: radius.card }}
      />
      <View style={{ gap: 2 }}>
        <T variant="heading">{listing.name}</T>
        <T variant="callout" color="inkSecondary">{listing.region}</T>
        <PriceLine listing={listing} free={free} />
      </View>
    </PressScale>
  );
}
