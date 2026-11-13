import { Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useAppFrame } from '@/hooks/use-app-frame';

export function DashboardHeader({ name }: { name: string }) {
  const { scale } = useAppFrame();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const firstName = name.split(' ')[0] || name;

  return (
    <View style={container(scale)}>
      <View style={styles.textBlock}>
        <Text style={greetingStyle(scale)}>{greeting}</Text>
        <Text style={nameStyle(scale)}>{firstName}</Text>
      </View>
      <View style={avatar(scale)}>
        <Text style={avatarInitial(scale)}>{(firstName[0] || 'U').toUpperCase()}</Text>
      </View>
    </View>
  );
}

function container(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26 * scale,
    marginTop: 14 * scale,
  };
}

const styles = {
  textBlock: {
    flex: 1,
  } as ViewStyle,
};

function greetingStyle(scale: number): TextStyle {
  return {
    color: '#E8ECF7',
    fontSize: 20 * scale,
    fontWeight: '400',
    lineHeight: 26 * scale,
  };
}

function nameStyle(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 40 * scale,
    fontWeight: '700',
    lineHeight: 48 * scale,
  };
}

function avatar(scale: number): ImageStyle & ViewStyle {
  return {
    width: 62 * scale,
    height: 62 * scale,
    borderRadius: 31 * scale,
    backgroundColor: 'rgba(183, 79, 245, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(183, 79, 245, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function avatarInitial(scale: number): TextStyle {
  return {
    color: '#D9A8FF',
    fontSize: 26 * scale,
    fontWeight: '700',
  };
}
