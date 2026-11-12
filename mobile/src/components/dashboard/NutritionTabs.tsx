import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { NutriColors } from '@/constants/nutri';
import { nutritionStats, nutrientOrder, type NutrientKey } from '@/data/dashboardMockData';
import { useAppFrame } from '@/hooks/use-app-frame';

type NutritionTabsProps = {
  active: NutrientKey;
  onChange: (key: NutrientKey) => void;
};

export function NutritionTabs({ active, onChange }: NutritionTabsProps) {
  const { scale } = useAppFrame();
  return (
    <View style={row(scale)}>
      {nutrientOrder.map((key) => {
        const selected = key === active;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => [
              tab(scale),
              !selected && styles.tabInactive,
              selected && styles.tabActive,
              pressed && styles.pressed,
            ]}>
            {selected ? (
              <LinearGradient
                colors={['#C670FF', '#8E3DF5']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={tabFill(scale, true)}>
                <Text style={textSelected(scale)}>{nutritionStats[key].label}</Text>
              </LinearGradient>
            ) : (
              <View style={tabFill(scale, false)}>
                <Text style={text(scale)}>{nutritionStats[key].label}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function row(scale: number): ViewStyle {
  return {
    flexDirection: 'row',
    marginTop: 17 * scale,
    marginHorizontal: 26 * scale,
    gap: 10 * scale,
  };
}

function tab(scale: number): ViewStyle {
  return {
    height: 58 * scale,
    borderRadius: 17 * scale,
    overflow: 'hidden',
  };
}

function tabFill(scale: number, selected: boolean): ViewStyle {
  return {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (selected ? 30 : 21) * scale,
  };
}

function text(scale: number): TextStyle {
  return {
    color: '#E7EBF5',
    fontSize: 15 * scale,
    fontWeight: '500',
  };
}

function textSelected(scale: number): TextStyle {
  return {
    color: '#FFFFFF',
    fontSize: 15.5 * scale,
    fontWeight: '600',
  };
}

const styles = {
  tabInactive: {
    backgroundColor: 'rgba(12, 27, 50, 0.9)',
    borderWidth: 1.2,
    borderColor: '#1E3A5F',
  } as ViewStyle,
  tabActive: {
    shadowColor: NutriColors.purple,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  } as ViewStyle,
  pressed: {
    opacity: 0.85,
  } as ViewStyle,
};
