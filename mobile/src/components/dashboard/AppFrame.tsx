import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';

export function AppFrame({ children }: PropsWithChildren) {
  const { scale, frameWidth } = useAppFrame();
  const insets = useSafeAreaInsets();
  const radius = 42 * scale;

  return (
    <View style={styles.page}>
      <View style={[glow(scale), { width: frameWidth, borderRadius: radius + 3 }]}>
        <View
          style={[
            frame(scale),
            { borderRadius: radius, paddingTop: insets.top },
          ]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = {
  page: {
    flex: 1,
    backgroundColor: '#00000A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  } as ViewStyle,
};

function glow(scale: number): ViewStyle {
  return {
    flex: 1,
    padding: 3,
    backgroundColor: 'rgba(22, 139, 255, 0.28)',
    shadowColor: NutriColors.borderBlue,
    shadowOpacity: 0.55,
    shadowRadius: 18 * scale,
    shadowOffset: { width: 0, height: 0 },
  };
}

function frame(scale: number): ViewStyle {
  return {
    flex: 1,
    backgroundColor: NutriColors.bg,
    borderWidth: 2,
    borderColor: NutriColors.borderBlue,
    overflow: 'hidden',
  };
}
