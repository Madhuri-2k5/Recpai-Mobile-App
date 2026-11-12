import { useState, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { GradientButton } from '@/components/gradient-button';
import {
  ArrowLeftIcon,
  CarbsIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  FatIcon,
  FlameTileIcon,
  IngredientDotIcon,
  ProteinIcon,
  SparkleIcon,
  UtensilsIcon,
} from '@/components/icons';
import { recipes, scaleQuantity, type Recipe } from '@/data/recipesMockData';

export default function ScanRecipeScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const params = useLocalSearchParams<{ cuisine?: string; servings?: string }>();
  const [saved, setSaved] = useState(false);

  const recipe: Recipe = recipes[0];
  const cuisine = params.cuisine || 'Continental';
  const servings = Math.max(1, Math.min(12, Number(params.servings ?? 2) || 2));

  const multiplier = servings / recipe.servings;

  const totals = {
    kcal: Math.round(recipe.kcal * multiplier),
    protein: Math.round(recipe.protein * multiplier),
    carbs: Math.round(recipe.carbs * multiplier),
    fat: Math.round(recipe.fat * multiplier),
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 * scale }}>
        <View style={heroWrap(scale)}>
          <Image source={recipe.image} style={heroImage(scale)} contentFit="cover" />
          <View style={heroOverlay(scale)} pointerEvents="none">
            <Pressable onPress={() => router.back()} style={circleButton(scale)}>
              <ArrowLeftIcon size={22 * scale} />
            </Pressable>
            <Text style={heroTitle(scale)}>Scan Result</Text>
            <Pressable onPress={() => router.dismissTo('/scan')} style={circleButton(scale)}>
              <CloseIcon size={22 * scale} />
            </Pressable>
          </View>
        </View>

        <View style={bodyWrap(scale)}>
          <View style={detectedRow(scale)}>
            <View style={aiChip(scale)}>
              <CheckCircleIcon size={16 * scale} circleColor={NutriColors.green} />
              <Text style={aiChipText(scale)}>AI Detected</Text>
            </View>
            <View style={aiChip(scale)}>
              <SparkleIcon size={14 * scale} color={NutriColors.purple} />
              <Text style={aiChipText(scale)}>Confidence: {recipe.confidence}%</Text>
            </View>
          </View>

          <Text style={name(scale)}>{recipe.name}</Text>

          <View style={metaRow(scale)}>
            <View style={metaItem(scale)}>
              <ClockIcon size={17 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>{recipe.timeMinutes} min</Text>
            </View>
            <View style={metaDot} />
            <View style={metaItem(scale)}>
              <UtensilsIcon size={16 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>{cuisine}</Text>
            </View>
            <View style={metaDot} />
            <View style={metaItem(scale)}>
              <UtensilsIcon size={16 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>Serves {servings}</Text>
            </View>
          </View>

          <View style={tilesRow(scale)}>
            <MacroTile
              icon={<FlameTileIcon size={22 * scale} />}
              value={`${totals.kcal}`}
              unit="kcal"
              scale={scale}
            />
            <MacroTile
              icon={<ProteinIcon size={22 * scale} />}
              value={`${totals.protein}g`}
              unit="protein"
              scale={scale}
            />
            <MacroTile
              icon={<CarbsIcon size={22 * scale} />}
              value={`${totals.carbs}g`}
              unit="carbs"
              scale={scale}
            />
            <MacroTile
              icon={<FatIcon size={22 * scale} />}
              value={`${totals.fat}g`}
              unit="fat"
              scale={scale}
            />
          </View>

          <Text style={sectionTitle(scale)}>Estimated Time</Text>
          <View style={timeCard(scale)}>
            <ClockIcon size={24 * scale} color={NutriColors.purple} />
            <Text style={timeValue(scale)}>{recipe.timeMinutes} minutes</Text>
            <Text style={timeCaption(scale)}>from prep to plate</Text>
          </View>

          <Text style={sectionTitle(scale)}>Groceries</Text>
          <View style={listCard(scale)}>
            {recipe.groceries.map((item, index) => (
              <View key={item.name} style={groceryRow(scale, index === recipe.groceries.length - 1)}>
                <View style={groceryBullet(scale)} />
                <Text style={groceryName(scale)}>{item.name}</Text>
                <Text style={groceryQty(scale)}>
                  {scaleQuantity(item.quantity, item.unit, multiplier)}
                </Text>
              </View>
            ))}
          </View>

          <Text style={sectionTitle(scale)}>Ingredients</Text>
          <View style={listCard(scale)}>
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={ingredient.name}
                style={ingredientRow(scale, index === recipe.ingredients.length - 1)}>
                <IngredientDotIcon size={26 * scale} />
                <Text style={ingredientName(scale)}>
                  {ingredient.name}{' '}
                  <Text style={ingredientQty(scale)}>
                    ({scaleQuantity(ingredient.quantity, ingredient.unit, multiplier)})
                  </Text>
                </Text>
                <Text style={ingredientKcal(scale)}>
                  {Math.round(ingredient.kcal * multiplier)} kcal
                </Text>
              </View>
            ))}
          </View>

          <Text style={sectionTitle(scale)}>Process</Text>
          <View style={listCard(scale)}>
            {recipe.steps.map((step, index) => (
              <View key={`${index}`} style={stepRow(scale, index === recipe.steps.length - 1)}>
                <View style={stepNumber(scale)}>
                  <Text style={stepNumberText(scale)}>{index + 1}</Text>
                </View>
                <Text style={stepText(scale)}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={footerButton(scale)}>
            {saved ? (
              <View style={savedBadge(scale)}>
                <CheckCircleIcon size={22 * scale} circleColor={NutriColors.green} />
                <Text style={savedBadgeText(scale)}>Added to My Meals</Text>
              </View>
            ) : (
              <GradientButton label="Add to My Meals" onPress={() => setSaved(true)} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MacroTile({
  icon,
  value,
  unit,
  scale,
}: {
  icon: ReactNode;
  value: string;
  unit: string;
  scale: number;
}) {
  return (
    <View style={tile(scale)}>
      {icon}
      <Text style={tileValue(scale)}>{value}</Text>
      <Text style={tileUnit(scale)}>{unit}</Text>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
};

const heroWrap = (scale: number): ViewStyle => ({
  alignSelf: 'stretch',
});

const heroImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 300 * scale,
});

const heroOverlay = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20 * scale,
  paddingTop: 18 * scale,
});

const circleButton = (scale: number): ViewStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(2, 8, 23, 0.55)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
});

const heroTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
  textShadowColor: 'rgba(0, 0, 0, 0.6)',
  textShadowRadius: 6,
});

const bodyWrap = (scale: number): ViewStyle => ({
  paddingHorizontal: 26 * scale,
});

const detectedRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
  marginTop: -28 * scale,
});

const aiChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 12 * scale,
  paddingVertical: 7 * scale,
  borderRadius: 11 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  shadowColor: '#000000',
  shadowOpacity: 0.4,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
});

const aiChipText = (scale: number): TextStyle => ({
  color: '#E7EBF5',
  fontSize: 12.5 * scale,
  fontWeight: '700',
});

const name = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 28 * scale,
  fontWeight: '700',
  marginTop: 18 * scale,
});

const metaRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginTop: 12 * scale,
});

const metaItem = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
});

const metaText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  fontWeight: '600',
});

const metaDot: ViewStyle = {
  width: 3,
  height: 3,
  borderRadius: 2,
  backgroundColor: NutriColors.textFaint,
};

const tilesRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
  marginTop: 20 * scale,
});

const tile = (scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 14 * scale,
  borderRadius: 17 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const tileValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
  marginTop: 8 * scale,
});

const tileUnit = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 11.5 * scale,
  marginTop: 3,
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
  marginTop: 28 * scale,
  marginBottom: 13 * scale,
});

const timeCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  padding: 16 * scale,
  borderRadius: 18 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.4)',
});

const timeValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16.5 * scale,
  fontWeight: '700',
});

const timeCaption = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  flex: 1,
  textAlign: 'right',
});

const listCard = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 16 * scale,
});

const groceryRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  paddingVertical: 14 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const groceryBullet = (scale: number): ViewStyle => ({
  width: 9 * scale,
  height: 9 * scale,
  borderRadius: 5 * scale,
  backgroundColor: NutriColors.purple,
});

const groceryName = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 15 * scale,
  fontWeight: '500',
  flex: 1,
});

const groceryQty = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '600',
});

const ingredientRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  paddingVertical: 13 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const ingredientName = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 15 * scale,
  fontWeight: '500',
  flex: 1,
});

const ingredientQty = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '400',
});

const ingredientKcal = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  fontWeight: '600',
});

const stepRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  gap: 13 * scale,
  paddingVertical: 14 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const stepNumber = (scale: number): ViewStyle => ({
  width: 28 * scale,
  height: 28 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.18)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const stepNumberText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13.5 * scale,
  fontWeight: '700',
});

const stepText = (scale: number): TextStyle => ({
  color: '#DDE3F0',
  fontSize: 14.5 * scale,
  lineHeight: 21 * scale,
  flex: 1,
});

const footerButton = (scale: number): ViewStyle => ({
  marginTop: 30 * scale,
});

const savedBadge = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10 * scale,
  height: 62 * scale,
  borderRadius: 19 * scale,
  backgroundColor: 'rgba(0, 213, 138, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(0, 213, 138, 0.45)',
});

const savedBadgeText = (scale: number): TextStyle => ({
  color: NutriColors.green,
  fontSize: 17 * scale,
  fontWeight: '700',
});
