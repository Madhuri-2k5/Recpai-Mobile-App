import { useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { NutriColors } from '@/constants/nutri';
import {
  DEFAULT_DATE,
  nutritionStats,
  weeklySeries,
  type NutrientKey,
} from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

import { CalorieProgressRing } from '@/components/dashboard/CalorieProgressRing';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatusBar } from '@/components/dashboard/DashboardStatusBar';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MacroSummary } from '@/components/dashboard/MacroSummary';
import { NutritionTabs } from '@/components/dashboard/NutritionTabs';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';

export default function DashboardScreen() {
  const { scale } = useAppFrame();
  const [activeTab, setActiveTab] = useState<NutrientKey>('calories');
  const [date, setDate] = useState<Date>(DEFAULT_DATE);
  const stat = nutritionStats[activeTab];

  return (
    <View style={styles.root}>
      <StatusBar hidden style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content(scale)}
        showsVerticalScrollIndicator={false}>
        <DashboardStatusBar />
        <DashboardHeader />
        <DateSelector date={date} onChange={setDate} />
        <NutritionTabs active={activeTab} onChange={setActiveTab} />
        <View style={divider(scale, 'top')} />
        <View style={analytics(scale)}>
          <CalorieProgressRing stat={stat} />
          <WeeklyBarChart
            series={weeklySeries[activeTab]}
            width={218 * scale}
            height={240 * scale}
            scale={scale}
          />
        </View>
        <View style={divider(scale, 'bottom')} />
        <MacroSummary />
      </ScrollView>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  scroll: {
    flex: 1,
  } as ViewStyle,
  content: (scale: number): ViewStyle => ({
    paddingBottom: 8 * scale,
    flexGrow: 1,
  }),
};

function divider(scale: number, position: 'top' | 'bottom'): ViewStyle {
  return {
    alignSelf: 'stretch',
    height: Math.max(1, 1.5 * scale),
    backgroundColor: NutriColors.divider,
    marginTop: (position === 'top' ? 41 : 0) * scale,
    marginHorizontal: 26 * scale,
  };
}

function analytics(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26 * scale,
    paddingBottom: 17 * scale,
    flexGrow: 1,
  };
}
