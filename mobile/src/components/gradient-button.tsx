import { Pressable, Text, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppFrame } from '@/hooks/use-app-frame';

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function GradientButton({ label, onPress, disabled, style }: GradientButtonProps) {
  const { scale } = useAppFrame();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { alignSelf: 'stretch' },
        style,
        pressed && { opacity: 0.85 },
      ]}>
      <LinearGradient
        colors={disabled ? ['#251D3A', '#251D3A'] : ['#B74FF5', '#753AFF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          height: 62 * scale,
          borderRadius: 19 * scale,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: disabled ? 'rgba(183, 79, 245, 0.25)' : 'rgba(255, 255, 255, 0.22)',
        }}>
        <Text
          style={{
            color: disabled ? '#6E6787' : '#FFFFFF',
            fontSize: 18 * scale,
            fontWeight: '700',
          }}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
