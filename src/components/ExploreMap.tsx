import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { pillLabel, PricePill, type ExploreMapProps } from './MapCard';

/** Grayscale custom style (applies where the provider supports it; iOS uses the muted Apple style). */
const grayscale = [
  { elementType: 'geometry', stylers: [{ color: '#EEEEEC' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6B6B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DCDCDA' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#E4E4E1' }] },
];

export function ExploreMap({ listings, freeFor, selectedId, onSelect, isOpen }: ExploreMapProps) {
  const region = useMemo(() => {
    const lats = listings.map((l) => l.coords.lat);
    const lngs = listings.map((l) => l.coords.lng);
    const minLat = Math.min(...lats, 34);
    const maxLat = Math.max(...lats, 49);
    const minLng = Math.min(...lngs, -124.5);
    const maxLng = Math.max(...lngs, -113.5);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.35,
      longitudeDelta: (maxLng - minLng) * 1.35,
    };
  }, [listings]);

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      customMapStyle={grayscale}
      mapType="mutedStandard"
      userInterfaceStyle="light"
      showsPointsOfInterests={false}
      showsCompass={false}
      showsScale={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      {listings.map((l) => (
        <Marker
          key={`${l.id}-${selectedId === l.id}-${freeFor(l)}-${[1, 2, 3, 4, 5].map((d) => (isOpen(l, d) ? 1 : 0)).join('')}`}
          coordinate={{ latitude: l.coords.lat, longitude: l.coords.lng }}
          onPress={(e) => {
            e.stopPropagation?.();
            onSelect(l.id);
          }}
          accessibilityLabel={`${l.name}, ${pillLabel(l, freeFor(l))}`}
          zIndex={selectedId === l.id ? 2 : 1}
          tracksViewChanges={false}
        >
          <PricePill label={pillLabel(l, freeFor(l))} selected={selectedId === l.id} isOpen={(d) => isOpen(l, d)} />
        </Marker>
      ))}
    </MapView>
  );
}
