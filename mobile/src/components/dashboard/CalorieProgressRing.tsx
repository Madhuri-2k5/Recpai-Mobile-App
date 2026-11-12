import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { NutriColors } from '@/constants/nutri';
import { calorieRingSegments, formatNumber, type NutrientStat } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

import { FlameIcon } from './icons';
import { ProgressRing, type RingSegment } from './ProgressRing';

function buildSegments(progress: number): RingSegment[] {
  const coloredSpan = Math.min(0.95, Math.max(0.55, progress * 1.47)) * 360;
  const blue = coloredSpan * calorieRingSegments.blueShare;
  const green = coloredSpan * calorieRingSegments.greenShare;
  const purple = coloredSpan * calorieRingSegments.purpleShare;
  return [
    { colors: ['#2E8BFF', '#54ACFF'], startDeg: 0, sweepDeg: blue },
    { colors: ['#00D58A', '#00D7C5'], startDeg: blue, sweepDeg: green },
    { colors: ['#8F3BF3', '#C366FF'], startDeg: blue + green, sweepDeg: purple },
  ];
}

export function CalorieProgressRing({ stat }: { stat: NutrientStat }) {
  const { scale } = useAppFrame();
  const size = 212 * scale;
  const strokeWidth = 14 * scale;
  const progress = stat.consumed / stat.target;
  const isCalories = stat.key === 'calories';
  const segments = isCalories
    ? buildSegments(progress)
    : [{ colors: stat.ringColors, startDeg: 0, sweepDeg: progress * 360 }];

  return (
    <View style={styles.container}>
      <ProgressRing
        size={size}
        strokeWidth={strokeWidth}
        segments={segments}
        trackColor={NutriColors.track}
        lineCap={isCalories ? 'butt' : 'round'}>
        {isCalories ? (
          <>
            <FlameIcon size={44 * scale} />
            <Text style={value(scale)}>{formatNumber(stat.consumed)}</Text>
            <Text style={unit(scale)}>{stat.unit}</Text>
          </>
        ) : (
          <>
            <Text style={value(scale)}>{stat.consumed}</Text>
            <Text style={unit(scale)}>{stat.unit}</Text>
          </>
        )}
      </ProgressRing>
      <Text style={goal(scale)}>
        of {formatNumber(stat.target)} {stat.unit}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    alignItems: 'center',
  } as ViewStyle,
};

function value(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 35 * scale,
    fontWeight: '700',
    lineHeight: 35 * scale,
    marginTop: 7 * scale,
  };
}

function unit(scale: number): TextStyle {
  return {
    color: '#EDF0FA',
    fontSize: 15 * scale,
    fontWeight: '500',
    lineHeight: 18 * scale,
  };
}

function goal(scale: number): TextStyle {
  return {
    color: '#E9EDF8',
    fontSize: 16 * scale,
    fontWeight: '500',
    marginTop: 14 * scale,
  };
}
