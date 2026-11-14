import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import {
  formatNumber,
  type NutrientKey,
  type NutrientStat,
  type WeeklySeries,
} from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';
import { api, type LoggedMeal, type NutritionSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

import { CalorieProgressRing } from '@/components/dashboard/CalorieProgressRing';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStatusBar } from '@/components/dashboard/DashboardStatusBar';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { MacroSummary } from '@/components/dashboard/MacroSummary';
import { NutritionTabs } from '@/components/dashboard/NutritionTabs';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import {
  ChevronRightIcon,
  FlameTileIcon,
  PlusIcon,
  ProteinIcon,
  ScanNavIcon,
  SparkleIcon,
  UtensilsIcon,
} from '@/components/icons';

function niceMax(target: number, stepBase: number) {
  return Math.max(stepBase, Math.ceil(target / stepBase) * stepBase);
}

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DashboardScreen() {
  const { scale } = useAppFrame();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NutrientKey>('calories');
  const [date, setDate] = useState(() => new Date());
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback((targetDate: Date) => {
    let active = true;
    setLoading(true);
    const dateStr = toLocalDateString(targetDate);

    Promise.all([api.nutritionSummary(dateStr), api.getMeals(dateStr)])
      .then(([summaryPayload, mealsPayload]) => {
        if (!active) return;
        setSummary(summaryPayload);
        setMeals(mealsPayload.log?.meals || []);
      })
      .catch(() => {
        if (active) {
          setSummary(null);
          setMeals([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const cancel = fetchDashboardData(date);
      return cancel;
    }, [date, fetchDashboardData])
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
      const highestValue = Math.max(targets[key] || 0, ...week.map((day) => day[key] || 0));
      const max = niceMax(highestValue, stepBase);
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
  const calLeft = summary ? Math.max(0, summary.targets.calories - summary.today.calories) : 0;
  const calPercent = summary ? Math.min(100, Math.round((summary.today.calories / summary.targets.calories) * 100)) : 0;
  const proteinPercent = summary ? Math.min(100, Math.round((summary.today.protein / summary.targets.protein) * 100)) : 0;

  return (
    <View style={styles.root}>
      <StatusBar hidden style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content(scale)}
        showsVerticalScrollIndicator={false}>
        <DashboardStatusBar />
        <DashboardHeader name={user?.name ?? 'there'} />
        <DateSelector
          date={date}
          onChange={(newDate) => {
            setDate(newDate);
          }}
        />

        {/* Horizontal Quick Stats Boxes (PRD: horizontal boxes beside the graph / summary) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={quickBoxesRow(scale)}>
          <View style={quickBox(scale, '#8B5CF6')}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.25)', 'rgba(109, 40, 217, 0.1)']}
              style={quickBoxGradient(scale)}>
              <View style={quickBoxIconWrap(scale, 'rgba(183, 79, 245, 0.25)')}>
                <FlameTileIcon size={20 * scale} />
              </View>
              <Text style={quickBoxLabel(scale)}>Remaining</Text>
              <Text style={quickBoxValue(scale)}>{formatNumber(calLeft)}</Text>
              <Text style={quickBoxUnit(scale)}>kcal budget left</Text>
            </LinearGradient>
          </View>

          <View style={quickBox(scale, '#00D58A')}>
            <LinearGradient
              colors={['rgba(0, 213, 138, 0.22)', 'rgba(0, 180, 110, 0.08)']}
              style={quickBoxGradient(scale)}>
              <View style={quickBoxIconWrap(scale, 'rgba(0, 213, 138, 0.2)')}>
                <ProteinIcon size={20 * scale} />
              </View>
              <Text style={quickBoxLabel(scale)}>Protein Goal</Text>
              <Text style={quickBoxValue(scale)}>{proteinPercent}%</Text>
              <Text style={quickBoxUnit(scale)}>
                {summary ? `${summary.today.protein}g / ${summary.targets.protein}g` : '—'}
              </Text>
            </LinearGradient>
          </View>

          <View style={quickBox(scale, '#2E8BFF')}>
            <LinearGradient
              colors={['rgba(46, 139, 255, 0.22)', 'rgba(30, 90, 200, 0.08)']}
              style={quickBoxGradient(scale)}>
              <View style={quickBoxIconWrap(scale, 'rgba(46, 139, 255, 0.2)')}>
                <UtensilsIcon size={18 * scale} color="#7DB5FF" />
              </View>
              <Text style={quickBoxLabel(scale)}>Daily Intake</Text>
              <Text style={quickBoxValue(scale)}>{calPercent}%</Text>
              <Text style={quickBoxUnit(scale)}>
                {meals.length} {meals.length === 1 ? 'meal' : 'meals'} logged
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>

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

            {/* Horizontal Boxes: Today's Logged Meals Carousel */}
            <View style={mealsSectionHeader(scale)}>
              <View>
                <Text style={mealsSectionTitle(scale)}>Logged Meals</Text>
                <Text style={mealsSectionSubtitle(scale)}>
                  {meals.length} {meals.length === 1 ? 'recipe' : 'recipes'} tracked for this date
                </Text>
              </View>
              <Pressable onPress={() => router.push('/scan')} style={scanShortcut(scale)}>
                <PlusIcon size={16 * scale} />
                <Text style={scanShortcutText(scale)}>Scan</Text>
              </Pressable>
            </View>

            {meals.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={mealsRow(scale)}>
                {meals.map((meal, index) => (
                  <Pressable
                    key={`${meal.recipeId || meal.title}-${index}`}
                    onPress={() => {
                      if (meal.recipeId) {
                        router.push({
                          pathname: '/recipe/[id]',
                          params: { id: meal.recipeId },
                        });
                      }
                    }}
                    style={mealCard(scale)}>
                    {meal.imageUrl ? (
                      <Image source={{ uri: meal.imageUrl }} style={mealCardImage(scale)} contentFit="cover" />
                    ) : (
                      <View style={[mealCardImage(scale), mealCardPlaceholder(scale)]}>
                        <UtensilsIcon size={24 * scale} color={NutriColors.purple} />
                      </View>
                    )}
                    <View style={styles.mealCardBody}>
                      <Text style={mealCardTitle(scale)} numberOfLines={1}>
                        {meal.title}
                      </Text>
                      <Text style={mealCardMeta(scale)}>
                        {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'} • {meal.calories} kcal
                      </Text>
                      <View style={macroTagRow(scale)}>
                        <View style={macroTag(scale, '#00D58A')}>
                          <Text style={macroTagText(scale, '#00D58A')}>{meal.protein}g P</Text>
                        </View>
                        <View style={macroTag(scale, '#00D7C5')}>
                          <Text style={macroTagText(scale, '#00D7C5')}>{meal.carbs}g C</Text>
                        </View>
                        <View style={macroTag(scale, '#FFAC38')}>
                          <Text style={macroTagText(scale, '#FFAC38')}>{meal.fat}g F</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Pressable onPress={() => router.push('/scan')} style={emptyMealsCard(scale)}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(30, 41, 59, 0.6)']}
                  style={emptyMealsGradient(scale)}>
                  <View style={emptyMealsIconWrap(scale)}>
                    <ScanNavIcon size={26 * scale} color={NutriColors.purple} />
                  </View>
                  <View style={styles.emptyMealsText}>
                    <Text style={emptyMealsTitle(scale)}>No meals logged yet</Text>
                    <Text style={emptyMealsSubtitle(scale)}>
                      Scan your food or ingredients to create a recipe and track macros.
                    </Text>
                  </View>
                  <ChevronRightIcon size={20 * scale} color={NutriColors.purple} />
                </LinearGradient>
              </Pressable>
            )}

            {/* Quick AI Scan Prompt Card */}
            <Pressable onPress={() => router.push('/scan')} style={aiScanCard(scale)}>
              <LinearGradient
                colors={['#8F3BF3', '#B74FF5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={aiScanGradient(scale)}>
                <SparkleIcon size={24 * scale} color="#FFD76B" />
                <View style={styles.aiScanText}>
                  <Text style={aiScanTitle(scale)}>Scan Ingredients &amp; Cook</Text>
                  <Text style={aiScanSubtitle(scale)}>
                    PhonePe-style instant food camera scan + recipes for your dietary goals.
                  </Text>
                </View>
                <View style={aiScanButton(scale)}>
                  <Text style={aiScanButtonText(scale)}>Scan Food</Text>
                </View>
              </LinearGradient>
            </Pressable>
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
    paddingBottom: 150 * scale,
    flexGrow: 1,
  }),
  loaderWrap: (scale: number): ViewStyle => ({
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40 * scale,
  }),
  mealCardBody: {
    padding: 12,
  } as ViewStyle,
  emptyMealsText: {
    flex: 1,
  } as ViewStyle,
  aiScanText: {
    flex: 1,
  } as ViewStyle,
};

function divider(scale: number, position: 'top' | 'bottom'): ViewStyle {
  return {
    alignSelf: 'stretch',
    height: Math.max(1, 1.5 * scale),
    backgroundColor: NutriColors.divider,
    marginTop: (position === 'top' ? 24 : 0) * scale,
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

const quickBoxesRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 12 * scale,
  paddingHorizontal: 26 * scale,
  marginTop: 16 * scale,
});

const quickBox = (scale: number, borderColor: string): ViewStyle => ({
  width: 140 * scale,
  borderRadius: 18 * scale,
  borderWidth: 1.2,
  borderColor,
  overflow: 'hidden',
  backgroundColor: NutriColors.card,
});

const quickBoxGradient = (scale: number): ViewStyle => ({
  padding: 14 * scale,
  alignItems: 'flex-start',
});

const quickBoxIconWrap = (scale: number, bg: string): ViewStyle => ({
  width: 36 * scale,
  height: 36 * scale,
  borderRadius: 11 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bg,
  marginBottom: 10 * scale,
});

const quickBoxLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  fontWeight: '600',
});

const quickBoxValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 22 * scale,
  fontWeight: '700',
  marginTop: 4 * scale,
});

const quickBoxUnit = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 11 * scale,
  marginTop: 2 * scale,
});

const mealsSectionHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 26 * scale,
  marginTop: 18 * scale,
  marginBottom: 12 * scale,
});

const mealsSectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
});

const mealsSectionSubtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  marginTop: 2 * scale,
});

const scanShortcut = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 14 * scale,
  paddingVertical: 7 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const scanShortcutText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
});

const mealsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 14 * scale,
  paddingHorizontal: 26 * scale,
  paddingBottom: 8 * scale,
});

const mealCard = (scale: number): ViewStyle => ({
  width: 200 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  overflow: 'hidden',
});

const mealCardImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 110 * scale,
  backgroundColor: '#1E293B',
});

const mealCardPlaceholder = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.12)',
});

const mealCardTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const mealCardMeta = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  marginTop: 4 * scale,
});

const macroTagRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 6 * scale,
  marginTop: 8 * scale,
});

const macroTag = (scale: number, color: string): ViewStyle => ({
  paddingHorizontal: 6 * scale,
  paddingVertical: 2 * scale,
  borderRadius: 6 * scale,
  backgroundColor: `${color}18`,
  borderWidth: 1,
  borderColor: `${color}40`,
});

const macroTagText = (scale: number, color: string): TextStyle => ({
  color,
  fontSize: 10.5 * scale,
  fontWeight: '700',
});

const emptyMealsCard = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  borderRadius: 18 * scale,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const emptyMealsGradient = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  padding: 16 * scale,
});

const emptyMealsIconWrap = (scale: number): ViewStyle => ({
  width: 48 * scale,
  height: 48 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.2)',
});

const emptyMealsTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
  fontWeight: '700',
});

const emptyMealsSubtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  lineHeight: 18 * scale,
  marginTop: 3 * scale,
});

const aiScanCard = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  marginTop: 20 * scale,
  borderRadius: 20 * scale,
  overflow: 'hidden',
});

const aiScanGradient = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  padding: 18 * scale,
});

const aiScanTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const aiScanSubtitle = (scale: number): TextStyle => ({
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 12.5 * scale,
  lineHeight: 18 * scale,
  marginTop: 3 * scale,
});

const aiScanButton = (scale: number): ViewStyle => ({
  paddingHorizontal: 12 * scale,
  paddingVertical: 8 * scale,
  borderRadius: 12 * scale,
  backgroundColor: '#FFFFFF',
});

const aiScanButtonText = (scale: number): TextStyle => ({
  color: '#6D28D9',
  fontSize: 12.5 * scale,
  fontWeight: '800',
});
