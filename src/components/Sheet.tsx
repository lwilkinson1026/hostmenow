import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { useInsets } from '@/lib/insets';
import { useDesktop } from '@/lib/layout';

import { colors, radius, shadow } from '@/theme';

export type SheetRef = BottomSheetModal;

type Props = { children: ReactNode; onDismiss?: () => void; dismissible?: boolean };

/** Desktop: the sheet floats as a centered panel this wide, lifted off the bottom edge. */
const DESKTOP_SHEET = 480;

/** Bottom sheet: rises in 300ms, radius 20, the only shadow in the system. */
export const Sheet = forwardRef<BottomSheetModal, Props>(function Sheet({ children, onDismiss, dismissible = true }, ref) {
  const insets = useInsets();
  const desktop = useDesktop();
  const { width } = useWindowDimensions();
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
      style={[shadow.sheet, desktop ? { marginHorizontal: (width - DESKTOP_SHEET) / 2 } : null]}
      detached={desktop}
      bottomInset={desktop ? 32 : 0}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});
