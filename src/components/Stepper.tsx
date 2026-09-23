import { Pressable, View } from 'react-native';

import { haptics } from '@/services';
import { colors, radius } from '@/theme';
import { Icon } from './Icon';
import { T } from './Text';

type Props = {
  label: string;
  caption?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  /** Plural noun for screen readers, e.g. "guests". */
  noun: string;
};

function StepButton({ icon, disabled, onPress, label }: { icon: 'plus' | 'minus'; disabled: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptics.tapLight();
        onPress();
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.light.line,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Icon name={icon} size={16} />
    </Pressable>
  );
}

export function Stepper({ label, caption, value, min, max, onChange, noun }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
      <View>
        <T>{label}</T>
        {caption ? <T variant="caption" color="inkSecondary">{caption}</T> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }} accessibilityLabel={`${value} ${value === 1 ? noun.replace(/s$/, '') : noun}`}>
        <StepButton icon="minus" label={`Fewer ${noun}`} disabled={value <= min} onPress={() => onChange(value - 1)} />
        <T variant="bodyStrong" style={{ minWidth: 12, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</T>
        <StepButton icon="plus" label={`More ${noun}`} disabled={value >= max} onPress={() => onChange(value + 1)} />
      </View>
    </View>
  );
}
