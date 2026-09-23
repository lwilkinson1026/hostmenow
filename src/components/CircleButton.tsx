import { colors, radius } from '@/theme';
import { Icon, type IconName } from './Icon';
import { PressScale } from './PressScale';

/** White circle floating over photography: back and share. */
export function CircleButton({ icon, onPress, label, iconSize = 20 }: { icon: IconName; onPress: () => void; label: string; iconSize?: number }) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={{ width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.light.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={iconSize} />
    </PressScale>
  );
}
