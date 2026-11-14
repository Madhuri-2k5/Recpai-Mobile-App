import { useCallback, useState, type ReactNode } from 'react';
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
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';

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
  MinusIcon,
  PlusIcon,
  ProteinIcon,
  SparkleIcon,
  UtensilsIcon,
} from '@/components/icons';
import { api, ApiError, type Recipe } from '@/lib/api';
import { resetScanFlow, scanFlow } from '@/lib/scan-flow';
import { scaleNutrition, scaleQuantity } from '@/lib/recipe-scaler';

type Phase = 'generating' | 'ready' | 'error';

export default function ScanRecipeScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const params = useLocalSearchParams<{ cuisine?: string; servings?: string }>();

  const cuisine = params.cuisine || 'Continental';
  const initialServings = Math.max(1, Math.min(12, Number(params.servings ?? 2) || 2));

  const [phase, setPhase] = useState<Phase>(scanFlow.recipe ? 'ready' : 'generating');
  const [recipe, setRecipe] = useState<Recipe | null>(scanFlow.recipe);
  const [currentServings, setCurrentServings] = useState<number>(initialServings);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (scanFlow.recipe) {
        setRecipe(scanFlow.recipe);
        setCurrentServings(scanFlow.recipe.servings || initialServings);
        setPhase('ready');
        return;
      }
      let active = true;
      setPhase('generating');
      api
        .generateRecipe({
          imageBase64: scanFlow.imageBase64 ?? undefined,
          cuisine,
          servings: initialServings,
        })
        .then((payload) => {
          if (!active) return;
          scanFlow.recipe = payload.recipe;
          setRecipe(payload.recipe);
          setCurrentServings(payload.recipe.servings || initialServings);
          setPhase('ready');
        })
        .catch((error) => {
          if (!active) return;
          setErrorMessage(error instanceof ApiError ? error.message : 'Recipe generation failed. Try again.');
          setPhase('error');
        });
      return () => {
        active = false;
      };
    }, [cuisine, initialServings])
  );

  const baseServings = recipe?.servings || 1;
  const scaleFactor = currentServings / baseServings;
  const scaledNutrition = recipe ? scaleNutrition(recipe.nutrition, scaleFactor) : null;

  async function addToMyMeals() {
    if (!recipe || saving || saved) return;
    setSaving(true);
    try {
      const savedPayload = await api.saveRecipe(recipe);
      const recipeId = savedPayload.recipe?._id || savedPayload.recipe?.id;
      if (recipeId) {
        await api.logMeal(recipeId, currentServings);
      }
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }

  function closeFlow() {
    resetScanFlow();
    router.dismissTo('/scan');
  }

  if (phase === 'generating') {
    return (
      <View style={styles.centerRoot}>
        <StatusBar style="light" />
        <View style={generatingCard(scale)}>
          <SparkleIcon size={44 * scale} color={NutriColors.purple} />
          <Text style={generatingTitle(scale)}>Creating your recipe…</Text>
          <Text style={generatingBody(scale)}>
            NutriAI is analyzing your ingredients and building a {cuisine} recipe for {initialServings}{' '}
            {initialServings === 1 ? 'person' : 'people'}. This takes a few seconds.
          </Text>
          <ActivityIndicator color={NutriColors.purple} style={{ marginTop: 18 * scale }} />
        </View>
      </View>
    );
  }

  if (phase === 'error' || !recipe || !scaledNutrition) {
    return (
      <View style={styles.centerRoot}>
        <StatusBar style="light" />
        <View style={generatingCard(scale)}>
          <Text style={generatingTitle(scale)}>Scan failed</Text>
          <Text style={generatingBody(scale)}>{errorMessage}</Text>
          <Pressable onPress={() => router.back()} style={retryButton(scale)}>
            <Text style={retryText(scale)}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 * scale }}>
        <View style={heroWrap(scale)}>
          <Image
            source={
              recipe.imageUrl
                ? { uri: recipe.imageUrl }
                : scanFlow.imageUri
                  ? { uri: scanFlow.imageUri }
                  : undefined
            }
            style={heroImage(scale)}
            contentFit="cover"
          />
          <View style={heroOverlay(scale)} pointerEvents="box-none">
            <Pressable onPress={() => router.back()} style={circleButton(scale)}>
              <ArrowLeftIcon size={22 * scale} />
            </Pressable>
            <Text style={heroTitle(scale)}>Scan Result</Text>
            <Pressable onPress={closeFlow} style={circleButton(scale)}>
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
              <Text style={aiChipText(scale)}>
                Confidence: {Math.round((recipe.scanConfidence ?? 0) * 100)}%
              </Text>
            </View>
          </View>

          <Text style={name(scale)}>{recipe.title}</Text>

          <View style={metaRow(scale)}>
            <View style={metaItem(scale)}>
              <ClockIcon size={17 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>{recipe.prepTimeMinutes} min</Text>
            </View>
            <View style={metaDot} />
            <View style={metaItem(scale)}>
              <UtensilsIcon size={16 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>{recipe.cuisine}</Text>
            </View>
            <View style={metaDot} />
            <View style={metaItem(scale)}>
              <UtensilsIcon size={16 * scale} color={NutriColors.textDim} />
              <Text style={metaText(scale)}>Serves {currentServings}</Text>
            </View>
          </View>

          {/* Scalable Servings Control directly on recipe screen */}
          <View style={servingsCard(scale)}>
            <View style={servingsCardHeader(scale)}>
              <View style={servingsIconWrap(scale)}>
                <UtensilsIcon size={20 * scale} color={NutriColors.purple} />
              </View>
              <View style={styles.servingsHeaderText}>
                <Text style={servingsCardTitle(scale)}>Scalable Servings</Text>
                <Text style={servingsCardSubtitle(scale)}>
                  Cooking for {currentServings} {currentServings === 1 ? 'person' : 'people'}
                </Text>
              </View>
              <View style={stepper(scale)}>
                <Pressable
                  onPress={() => setCurrentServings((s) => Math.max(1, s - 1))}
                  style={stepperBtn(scale, currentServings <= 1)}>
                  <MinusIcon size={16 * scale} color={currentServings <= 1 ? NutriColors.textFaint : '#FFFFFF'} />
                </Pressable>
                <Text style={stepperVal(scale)}>{currentServings}</Text>
                <Pressable
                  onPress={() => setCurrentServings((s) => Math.min(12, s + 1))}
                  style={stepperBtn(scale, currentServings >= 12)}>
                  <PlusIcon size={16 * scale} color={currentServings >= 12 ? NutriColors.textFaint : '#FFFFFF'} />
                </Pressable>
              </View>
            </View>
            {scaleFactor !== 1 ? (
              <View style={scalingBadge(scale)}>
                <SparkleIcon size={13 * scale} color="#D9A8FF" />
                <Text style={scalingBadgeText(scale)}>
                  Adjusted {scaleFactor.toFixed(1).replace(/\.0$/, '')}x from original {baseServings}-person recipe. Ingredients & nutrition scaled.
                </Text>
              </View>
            ) : null}
          </View>

          <View style={tilesRow(scale)}>
            <MacroTile
              icon={<FlameTileIcon size={22 * scale} />}
              value={`${scaledNutrition.calories}`}
              unit="kcal"
              scale={scale}
            />
            <MacroTile
              icon={<ProteinIcon size={22 * scale} />}
              value={`${scaledNutrition.protein}g`}
              unit="protein"
              scale={scale}
            />
            <MacroTile
              icon={<CarbsIcon size={22 * scale} />}
              value={`${scaledNutrition.carbs}g`}
              unit="carbs"
              scale={scale}
            />
            <MacroTile
              icon={<FatIcon size={22 * scale} />}
              value={`${scaledNutrition.fat}g`}
              unit="fat"
              scale={scale}
            />
          </View>

          <Text style={sectionTitle(scale)}>Estimated Time</Text>
          <View style={timeCard(scale)}>
            <ClockIcon size={24 * scale} color={NutriColors.purple} />
            <Text style={timeValue(scale)}>{recipe.prepTimeMinutes} minutes</Text>
            <Text style={timeCaption(scale)}>from prep to plate</Text>
          </View>

          {recipe.groceries.length > 0 ? (
            <>
              <Text style={sectionTitle(scale)}>Groceries (for {currentServings})</Text>
              <View style={listCard(scale)}>
                {recipe.groceries.map((item, index) => (
                  <View
                    key={`${item.name}-${index}`}
                    style={groceryRow(scale, index === recipe.groceries.length - 1)}>
                    <View style={groceryBullet(scale)} />
                    <Text style={groceryName(scale)}>{item.name}</Text>
                    <Text style={groceryQty(scale)}>{scaleQuantity(item.quantity, scaleFactor)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={sectionTitle(scale)}>Ingredients (for {currentServings})</Text>
          <View style={listCard(scale)}>
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={`${ingredient.name}-${index}`}
                style={ingredientRow(scale, index === recipe.ingredients.length - 1)}>
                <IngredientDotIcon size={26 * scale} />
                <Text style={ingredientName(scale)}>
                  {ingredient.name}{' '}
                  <Text style={ingredientQty(scale)}>
                    ({scaleQuantity(ingredient.quantity, scaleFactor)})
                  </Text>
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
              <View style={{ width: '100%' }}>
                <View style={savedBadge(scale)}>
                  <CheckCircleIcon size={22 * scale} circleColor={NutriColors.green} />
                  <Text style={savedBadgeText(scale)}>
                    Added to My Meals ({currentServings} {currentServings === 1 ? 'serving' : 'servings'})
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    resetScanFlow();
                    router.replace('/(tabs)');
                  }}
                  style={viewDashboardBtn(scale)}>
                  <LinearGradient
                    colors={['#B74FF5', '#753AFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={viewDashboardGradient(scale)}>
                    <Text style={viewDashboardText(scale)}>View on Nutrition Dashboard</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <GradientButton
                label={
                  saving
                    ? 'Adding…'
                    : `Add to My Meals (${currentServings} ${currentServings === 1 ? 'serving' : 'servings'})`
                }
                onPress={addToMyMeals}
                disabled={saving}
              />
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
  centerRoot: {
    flex: 1,
    backgroundColor: NutriColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 34,
  } as ViewStyle,
  servingsHeaderText: {
    flex: 1,
  } as ViewStyle,
};

const generatingCard = (scale: number): ViewStyle => ({
  alignItems: 'center',
  padding: 26 * scale,
  borderRadius: 22 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  alignSelf: 'stretch',
});

const generatingTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 21 * scale,
  fontWeight: '700',
  marginTop: 14 * scale,
});

const generatingBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  lineHeight: 21 * scale,
  textAlign: 'center',
  marginTop: 8 * scale,
});

const retryButton = (scale: number): ViewStyle => ({
  marginTop: 20 * scale,
  paddingHorizontal: 30 * scale,
  paddingVertical: 13 * scale,
  borderRadius: 15 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const retryText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const heroWrap = (scale: number): ViewStyle => ({
  alignSelf: 'stretch',
});

const heroImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 300 * scale,
  backgroundColor: NutriColors.card,
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
  fontSize: 16 * scale,
  fontWeight: '600',
});

const bodyWrap = (scale: number): ViewStyle => ({
  paddingHorizontal: 24 * scale,
  marginTop: 18 * scale,
});

const detectedRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
});

const aiChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 12 * scale,
  paddingVertical: 6 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
});

const aiChipText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 12.5 * scale,
  fontWeight: '600',
});

const name = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 26 * scale,
  fontWeight: '800',
  marginTop: 14 * scale,
  letterSpacing: -0.4,
});

const metaRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginTop: 10 * scale,
});

const metaItem = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
});

const metaText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '500',
});

const metaDot: ViewStyle = {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: NutriColors.textDim,
};

const servingsCard = (scale: number): ViewStyle => ({
  marginTop: 18 * scale,
  padding: 16 * scale,
  borderRadius: 18 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.08)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.28)',
});

const servingsCardHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
});

const servingsIconWrap = (scale: number): ViewStyle => ({
  width: 40 * scale,
  height: 40 * scale,
  borderRadius: 13 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  alignItems: 'center',
  justifyContent: 'center',
});

const servingsCardTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const servingsCardSubtitle = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 12.5 * scale,
  fontWeight: '500',
  marginTop: 2 * scale,
});

const stepper = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8 * scale,
  backgroundColor: NutriColors.card,
  borderRadius: 14 * scale,
  paddingHorizontal: 8 * scale,
  paddingVertical: 4 * scale,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const stepperBtn = (scale: number, disabled: boolean): ViewStyle => ({
  width: 32 * scale,
  height: 32 * scale,
  borderRadius: 10 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: disabled ? 'transparent' : 'rgba(183, 79, 245, 0.22)',
});

const stepperVal = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '800',
  minWidth: 24 * scale,
  textAlign: 'center',
});

const scalingBadge = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  marginTop: 10 * scale,
  paddingTop: 10 * scale,
  borderTopWidth: 1,
  borderTopColor: 'rgba(183, 79, 245, 0.18)',
});

const scalingBadgeText = (scale: number): TextStyle => ({
  color: '#E9D5FF',
  fontSize: 12 * scale,
  fontWeight: '500',
  flex: 1,
});

const tilesRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginTop: 18 * scale,
});

const tile = (scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const tileValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '800',
  marginTop: 8 * scale,
});

const tileUnit = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 11 * scale,
  fontWeight: '600',
  marginTop: 2 * scale,
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
  marginTop: 24 * scale,
  marginBottom: 12 * scale,
});

const timeCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  padding: 16 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const timeValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const timeCaption = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
});

const listCard = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 18 * scale,
});

const groceryRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  paddingVertical: 13 * scale,
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

const viewDashboardBtn = (scale: number): ViewStyle => ({
  marginTop: 12 * scale,
  borderRadius: 19 * scale,
  overflow: 'hidden',
});

const viewDashboardGradient = (scale: number): ViewStyle => ({
  height: 56 * scale,
  alignItems: 'center',
  justifyContent: 'center',
});

const viewDashboardText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});
