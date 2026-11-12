import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { useAppFrame } from '@/hooks/use-app-frame';

import { BatteryIcon, SignalIcon, WifiIcon } from './icons';

export function DashboardStatusBar() {
  const { scale } = useAppFrame();
  return (
    <View style={container(scale)}>
      <Text style={time(scale)}>9:41</Text>
      <View style={iconRow(scale)}>
        <SignalIcon height={11 * scale} />
        <WifiIcon height={11.5 * scale} />
        <BatteryIcon height={12.5 * scale} />
      </View>
    </View>
  );
}

function container(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30 * scale,
    paddingTop: 12 * scale,
    height: 44 * scale,
  };
}

function time(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 15.5 * scale,
    fontWeight: '600',
    letterSpacing: 0.3,
  };
}

function iconRow(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6.5 * scale,
  };
}
