import { Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { user } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

export function DashboardHeader() {
  const { scale } = useAppFrame();
  return (
    <View style={container(scale)}>
      <View style={styles.textBlock}>
        <Text style={greeting(scale)}>{user.greeting}</Text>
        <Text style={name(scale)}>{user.name}</Text>
      </View>
      <Image source={user.avatar} style={avatar(scale)} contentFit="cover" transition={0} />
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

function greeting(scale: number): TextStyle {
  return {
    color: '#E8ECF7',
    fontSize: 20 * scale,
    fontWeight: '400',
    lineHeight: 26 * scale,
  };
}

function name(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 40 * scale,
    fontWeight: '700',
    lineHeight: 48 * scale,
  };
}

function avatar(scale: number): ImageStyle {
  return {
    width: 62 * scale,
    height: 62 * scale,
    borderRadius: 31 * scale,
  };
}
