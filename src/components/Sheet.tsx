import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { useInsets } from '@/lib/insets';

import { colors, radius, shadow } from '@/theme';

export type SheetRef = BottomSheetModal;

type Props = { children: ReactNode; onDismiss?: () => void; dismissible?: boolean };

/** Bottom sheet: rises in 300ms, radius 20, the only shadow in the system. */
export const Sheet = forwardRef<BottomSheetModal, Props>(function Sheet({ children, onDismiss, dismissible = true }, ref) {
  const insets = useInsets();
  const animationConfigs = useBottomSheetTimingConfigs({ duration: 300 });
  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.36} pressBehavior={dismissible ? 'close' : 'none'} />
    ),
    [dismissible],
  );
  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onDismiss}
      enablePanDownToClose={dismissible}
      animationConfigs={animationConfigs}
      backdropComponent={backdrop}
      backgroundStyle={{ backgroundColor: colors.light.bg, borderRadius: radius.sheet }}
      handleIndicatorStyle={{ width: 36, height: 5, backgroundColor: colors.light.line }}
      handleStyle={{ paddingTop: 10, paddingBottom: 14 }}
      style={shadow.sheet}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});
