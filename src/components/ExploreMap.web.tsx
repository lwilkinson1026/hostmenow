import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MapArt } from './StaticMap';
import { pillLabel, PricePill, type ExploreMapProps } from './MapCard';

/** Marker positions from the approved design, in a 393 x 438 frame. */
const designed: Record<string, [number, number]> = {
  'cedar-a-frame': [170, 70],
  'lake-cabin-pend-oreille': [262, 40],
  'desert-modern': [236, 330],
  'orchard-house': [196, 160],
  'coast-loft': [40, 120],
  'ski-chalet': [290, 112],
};

/** Web fallback: the static monochrome map with price pills. */
export function ExploreMap({ listings, freeFor, selectedId, onSelect, isOpen }: ExploreMapProps) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  return (
    <View style={{ flex: 1 }} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <MapArt />
      {box.w > 0 &&
        listings.map((l, i) => {
          const [dx, dy] = designed[l.id] ?? [40 + ((i * 70) % 280), 60 + ((i * 50) % 260)];
          return (
            <Pressable
              key={l.id}
              accessibilityRole="button"
              accessibilityLabel={`${l.name}, ${pillLabel(l, freeFor(l))}`}
              onPress={() => onSelect(l.id)}
              style={{ position: 'absolute', left: (dx / 393) * box.w, top: (dy / 438) * Math.max(box.h - 120, 300), zIndex: selectedId === l.id ? 2 : 1 }}
            >
              <PricePill label={pillLabel(l, freeFor(l))} selected={selectedId === l.id} isOpen={(d) => isOpen(l, d)} />
            </Pressable>
          );
        })}
    </View>
  );
}
