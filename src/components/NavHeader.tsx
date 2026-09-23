import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from './Icon';
import { T } from './Text';

/** Plain back chevron with an optional small title, for pushed light screens. */
export function NavHeader({ title }: { title?: string }) {
  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/explore'))}
        style={{ width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="chevron-left" size={24} />
      </Pressable>
      {title ? <T variant="calloutStrong">{title}</T> : null}
    </View>
  );
}
