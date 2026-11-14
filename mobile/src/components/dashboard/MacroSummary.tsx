import { Fragment } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { NutriColors } from '@/constants/nutri';
import { macroKeys, type NutrientStat } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

import { ProgressRing } from './ProgressRing';

export function MacroSummary({ stats }: { stats: Record<string, NutrientStat> }) {
  const { scale } = useAppFrame();
  if (!stats) return null;

  return (
    <View style={row(scale)}>
      {macroKeys.map((key, index) => {
        const stat = stats[key];
        if (!stat) return null;
        const target = Math.max(1, stat.target || 1);
        const consumed = stat.consumed || 0;
        const progress = Math.min(1, consumed / target);
        const percent = Math.min(999, Math.round((consumed / target) * 100));
        return (
          <Fragment key={key}>
            {index > 0 ? <View style={separator(scale)} /> : null}
            <View style={styles.column}>
              <ProgressRing
                size={74 * scale}
                strokeWidth={7.5 * scale}
                trackColor={NutriColors.track}
                lineCap="round"
                segments={[
                  { colors: stat.ringColors, startDeg: 0, sweepDeg: progress * 360 },
                ]}>
                <Text style={percentText(scale)}>{percent}%</Text>
              </ProgressRing>
              <Text style={name(scale)}>{stat.label}</Text>
              <Text style={quantity(scale)}>
                {consumed}
                {stat.unit}
                <Text style={quantityTarget(scale)}>
                  {' '}
                  / {stat.target}
                  {stat.unit}
                </Text>
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

function row(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28 * scale,
    marginHorizontal: 26 * scale,
    marginBottom: 30 * scale,
  };
}

function separator(scale: number): ViewStyle {
  return {
    width: 1,
    height: 64 * scale,
    backgroundColor: '#132A48',
    marginTop: 5 * scale,
  };
}

function percentText(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 16 * scale,
    fontWeight: '600',
  };
}

function name(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 16.5 * scale,
    fontWeight: '600',
    marginTop: 22 * scale,
  };
}

function quantity(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 15 * scale,
    fontWeight: '600',
    marginTop: 4 * scale,
  };
}

function quantityTarget(scale: number): TextStyle {
  return {
    color: NutriColors.textFaint,
    fontSize: 14 * scale,
    fontWeight: '500',
  };
}

const styles = {
  column: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
};
