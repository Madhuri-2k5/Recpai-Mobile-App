import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import {
  type NutrientKey,
  type NutrientStat,
  type WeeklySeries,
} from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';
import { api, type NutritionSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

import { CalorieProgressRing } from '@/components/dashboard/CalorieProgressRing';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatusBar } from '@/components/dashboard/DashboardStatusBar';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MacroSummary } from '@/components/dashboard/MacroSummary';
import { NutritionTabs } from '@/components/dashboard/NutritionTabs';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';

function niceMax(target: number, stepBase: number) {
  return Math.max(stepBase, Math.ceil(target / stepBase) * stepBase);
}

export default function DashboardScreen() {
  const { scale } = useAppFrame();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NutrientKey>('calories');
  const [date, setDate] = useState(() => new Date());
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .nutritionSummary()
        .then((payload) => {
          if (active) setSummary(payload);
        })
        .catch(() => {
          if (active) setSummary(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const stats = useMemo<Record<NutrientKey, NutrientStat> | null>(() => {
    if (!summary) return null;
    const { today, targets } = summary;
    return {
      calories: {
        key: 'calories',
        label: 'Calories',
        consumed: today.calories,
        target: targets.calories,
        unit: 'kcal',
        ringColors: ['#B74FF5', '#753AFF'],
      },
      protein: {
        key: 'protein',
        label: 'Protein',
        consumed: today.protein,
        target: targets.protein,
        unit: 'g',
        ringColors: ['#00D58A', '#00D7C5'],
      },
      carbs: {
        key: 'carbs',
        label: 'Carbs',
        consumed: today.carbs,
        target: targets.carbs,
        unit: 'g',
        ringColors: ['#00D7C5', '#38E5FF'],
      },
      fats: {
        key: 'fats',
        label: 'Fats',
        consumed: today.fat,
        target: targets.fat,
        unit: 'g',
        ringColors: ['#FFAC38', '#FFC46B'],
      },
    };
  }, [summary]);

  const series = useMemo<Record<NutrientKey, WeeklySeries> | null>(() => {
    if (!summary) return null;
    const { week, targets } = summary;
    const build = (key: 'calories' | 'protein' | 'carbs' | 'fat', unit: string, stepBase: number): WeeklySeries => {
      const max = niceMax(targets[key], stepBase);
      return {
        key: key === 'fat' ? 'fats' : key,
        unit,
        max,
        step: max / 4,
        values: week.map((day) => day[key]),
        labels: week.map((day) => day.day),
      };
    };
    return {
      calories: build('calories', 'kcal', 500),
      protein: build('protein', 'g', 25),
      carbs: build('carbs', 'g', 50),
      fats: build('fat', 'g', 25),
    };
  }, [summary]);

  const stat = stats?.[activeTab];

  return (
    <View style={styles.root}>
      <StatusBar hidden style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content(scale)}
        showsVerticalScrollIndicator={false}>
        <DashboardStatusBar />
        <DashboardHeader name={user?.name ?? 'there'} />
        <DateSelector date={date} onChange={setDate} />
        <NutritionTabs active={activeTab} onChange={setActiveTab} />
        <View style={divider(scale, 'top')} />
        {loading || !stat || !series ? (
          <View style={styles.loaderWrap(scale)}>
            <ActivityIndicator size="large" color={NutriColors.purple} />
          </View>
        ) : (
          <>
            <View style={analytics(scale)}>
              <CalorieProgressRing stat={stat} />
              <WeeklyBarChart
                series={series[activeTab]}
                width={218 * scale}
                height={240 * scale}
                scale={scale}
              />
            </View>
            <View style={divider(scale, 'bottom')} />
            <MacroSummary stats={stats!} />
          </>
        )}
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
  loaderWrap: (scale: number): ViewStyle => ({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40 * scale,
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
