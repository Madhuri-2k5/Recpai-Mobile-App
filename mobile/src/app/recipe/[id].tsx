import { useCallback, useState } from 'react';
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { GradientButton } from '@/components/gradient-button';
import {
  ArrowLeftIcon,
  CarbsIcon,
  CheckCircleIcon,
  ChevronDownIcon,
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
import { api, type Recipe } from '@/lib/api';
import { scaleNutrition, scaleQuantity } from '@/lib/recipe-scaler';

export default function RecipeDetailScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [groceriesOpen, setGroceriesOpen] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentServings, setCurrentServings] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const [loggingMeal, setLoggingMeal] = useState(false);
  const [mealLogged, setMealLogged] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .getRecipe(params.id ?? '')
        .then((payload) => {
          if (!active) return;
          setRecipe(payload.recipe);
          setCurrentServings(payload.recipe.servings || 1);
        })
        .catch(() => {
          if (active) setRecipe(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [params.id])
  );

  const baseServings = recipe?.servings || 1;
  const scaleFactor = currentServings / baseServings;
  const scaledNutrition = recipe ? scaleNutrition(recipe.nutrition, scaleFactor) : null;

  async function logAsMeal() {
    if (!recipe || loggingMeal || mealLogged) return;
    setLoggingMeal(true);
    try {
      const recipeId = recipe._id || recipe.id || '';
      await api.logMeal(recipeId, currentServings);
      setMealLogged(true);
    } catch {
      setMealLogged(false);
    } finally {
      setLoggingMeal(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.root, loaderStyle]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={NutriColors.purple} />
      </View>
    );
  }

  if (!recipe || !scaledNutrition) {
    return (
      <View style={[styles.root, loaderStyle]}>
        <StatusBar style="light" />
        <Text style={emptyText(scale)}>Recipe not found.</Text>
        <Pressable onPress={() => router.back()} style={retryButton(scale)}>
          <Text style={retryText(scale)}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 * scale }}>
        <View style={heroWrap}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={heroImage(scale)} contentFit="cover" />
          ) : (
            <View style={[heroImage(scale), heroPlaceholder(scale)]}>
              <UtensilsIcon size={54 * scale} color={NutriColors.purple} />
            </View>
          )}
          <View style={heroButtons(scale)}>
            <Pressable onPress={() => router.back()} style={circleButton(scale)}>
              <ArrowLeftIcon size={22 * scale} />
            </Pressable>
            <Pressable onPress={() => router.back()} style={circleButton(scale)}>
              <CloseIcon size={22 * scale} />
            </Pressable>
          </View>
        </View>

        <View style={bodyWrap(scale)}>
          <Text style={title(scale)}>{recipe.title}</Text>

          <View style={tagsRow(scale)}>
            <View style={tagChip(scale, 0)}>
              <Text style={tagText(scale, 0)}>{recipe.cuisine}</Text>
            </View>
            <View style={tagChip(scale, 1)}>
              <Text style={tagText(scale, 1)}>{recipe.difficulty || 'Medium'}</Text>
            </View>
            <View style={tagChip(scale, 1)}>
              <Text style={tagText(scale, 1)}>{recipe.prepTimeMinutes} min</Text>
            </View>
          </View>

          {/* Scalable Servings Controls directly on Recipe Screen */}
          <View style={servingsCard(scale)}>
            <View style={servingsCardHeader(scale)}>
              <View style={servingsIconWrap(scale)}>
                <UtensilsIcon size={20 * scale} color={NutriColors.purple} />
              </View>
              <View style={styles.servingsHeaderText}>
                <Text style={servingsCardTitle(scale)}>Scalable Servings</Text>
                <Text style={servingsCardSubtitle(scale)}>
                  Adjust for {currentServings} {currentServings === 1 ? 'person' : 'people'}
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
                  Scaled {scaleFactor.toFixed(1).replace(/\.0$/, '')}x from original {baseServings}-person portion.
                </Text>
              </View>
            ) : null}
          </View>

          <View style={tilesRow(scale)}>
            <View style={tile(scale)}>
              <FlameTileIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{scaledNutrition.calories}</Text>
              <Text style={tileUnit(scale)}>kcal</Text>
            </View>
            <View style={tile(scale)}>
              <ProteinIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{scaledNutrition.protein}g</Text>
              <Text style={tileUnit(scale)}>protein</Text>
            </View>
            <View style={tile(scale)}>
              <CarbsIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{scaledNutrition.carbs}g</Text>
              <Text style={tileUnit(scale)}>carbs</Text>
            </View>
            <View style={tile(scale)}>
              <FatIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{scaledNutrition.fat}g</Text>
              <Text style={tileUnit(scale)}>fat</Text>
            </View>
          </View>

          {/* Groceries Section (if present) */}
          {recipe.groceries && recipe.groceries.length > 0 ? (
            <>
              <Pressable
                onPress={() => setGroceriesOpen((open) => !open)}
                style={ingredientsHeader(scale)}>
                <Text style={sectionTitle(scale)}>Groceries (for {currentServings})</Text>
                <View style={chevronWrap(groceriesOpen, scale)}>
                  <ChevronDownIcon size={20 * scale} color={NutriColors.textDim} />
                </View>
              </Pressable>
              {groceriesOpen ? (
                <View style={listCard(scale)}>
                  {recipe.groceries.map((item, index) => (
                    <View
                      key={`${item.name}-${index}`}
                      style={ingredientRow(scale, index === recipe.groceries.length - 1)}>
                      <IngredientDotIcon size={24 * scale} />
                      <Text style={ingredientName(scale)}>
                        {item.name}{' '}
                        <Text style={ingredientQty(scale)}>
                          ({scaleQuantity(item.quantity, scaleFactor)})
                        </Text>
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          {/* Ingredients Section */}
          <Pressable
            onPress={() => setIngredientsOpen((open) => !open)}
            style={ingredientsHeader(scale)}>
            <Text style={sectionTitle(scale)}>Ingredients (for {currentServings})</Text>
            <View style={chevronWrap(ingredientsOpen, scale)}>
              <ChevronDownIcon size={20 * scale} color={NutriColors.textDim} />
            </View>
          </Pressable>

          {ingredientsOpen ? (
            <View style={listCard(scale)}>
              {recipe.ingredients.map((ingredient, index) => (
                <View
                  key={`${ingredient.name}-${index}`}
                  style={ingredientRow(scale, index === recipe.ingredients.length - 1)}>
                  <IngredientDotIcon size={30 * scale} />
                  <Text style={ingredientName(scale)}>
                    {ingredient.name}{' '}
                    <Text style={ingredientQty(scale)}>
                      ({scaleQuantity(ingredient.quantity, scaleFactor)})
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Process Steps */}
          {recipe.steps.length > 0 ? (
            <>
              <Text style={[sectionTitle(scale), sectionSpacing(scale)]}>Process</Text>
              <View style={listCard(scale)}>
                {recipe.steps.map((step, index) => (
                  <View key={`${index}`} style={ingredientRow(scale, index === recipe.steps.length - 1)}>
                    <View style={stepNumber(scale)}>
                      <Text style={stepNumberText(scale)}>{index + 1}</Text>
                    </View>
                    <Text style={stepBodyText(scale)}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={footerWrap(scale)} pointerEvents="box-none">
        {mealLogged ? (
          <View style={savedBadge(scale)}>
            <CheckCircleIcon size={22 * scale} circleColor={NutriColors.green} />
            <Text style={savedBadgeText(scale)}>
              Logged to Today&apos;s Meals ({currentServings} {currentServings === 1 ? 'serving' : 'servings'})
            </Text>
          </View>
        ) : (
          <GradientButton
            label={
              loggingMeal
                ? 'Logging to Meals…'
                : `Log as Today's Meal (${currentServings} ${currentServings === 1 ? 'serving' : 'servings'})`
            }
            onPress={logAsMeal}
            disabled={loggingMeal}
          />
        )}
      </View>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  servingsHeaderText: {
    flex: 1,
  } as ViewStyle,
};

const loaderStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
};

const emptyText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 16 * scale,
});

const retryButton = (scale: number): ViewStyle => ({
  paddingHorizontal: 26 * scale,
  paddingVertical: 12 * scale,
  borderRadius: 14 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const retryText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const heroWrap: ViewStyle = {
  alignSelf: 'stretch',
};

const heroImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 380 * scale,
  backgroundColor: NutriColors.card,
});

const heroPlaceholder = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
});

const heroButtons = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: 18 * scale,
  left: 20 * scale,
  right: 20 * scale,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
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

const bodyWrap = (scale: number): ViewStyle => ({
  paddingHorizontal: 24 * scale,
  marginTop: 22 * scale,
});

const title = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 27 * scale,
  fontWeight: '800',
  letterSpacing: -0.4,
});

const tagsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8 * scale,
  marginTop: 12 * scale,
});

const tagChip = (scale: number, variant: number): ViewStyle => ({
  paddingHorizontal: 12 * scale,
  paddingVertical: 5 * scale,
  borderRadius: 12 * scale,
  backgroundColor: variant === 0 ? 'rgba(183, 79, 245, 0.16)' : 'rgba(255, 255, 255, 0.06)',
  borderWidth: 1,
  borderColor: variant === 0 ? 'rgba(183, 79, 245, 0.4)' : 'rgba(255, 255, 255, 0.1)',
});

const tagText = (scale: number, variant: number): TextStyle => ({
  color: variant === 0 ? '#D9A8FF' : NutriColors.textDim,
  fontSize: 12.5 * scale,
  fontWeight: '600',
});

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
  fontSize: 18 * scale,
  fontWeight: '800',
  marginTop: 8 * scale,
});

const tileUnit = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 11 * scale,
  fontWeight: '600',
  marginTop: 2 * scale,
});

const ingredientsHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 26 * scale,
  marginBottom: 12 * scale,
});

const chevronWrap = (open: boolean, scale: number): ViewStyle => ({
  width: 32 * scale,
  height: 32 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  transform: [{ rotate: open ? '180deg' : '0deg' }],
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
});

const sectionSpacing = (scale: number): TextStyle => ({
  marginTop: 28 * scale,
  marginBottom: 14 * scale,
});

const listCard = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 16 * scale,
});

const ingredientRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  paddingVertical: 14 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const ingredientName = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 15.5 * scale,
  fontWeight: '500',
  flex: 1,
});

const ingredientQty = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14.5 * scale,
  fontWeight: '400',
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

const stepBodyText = (scale: number): TextStyle => ({
  color: '#DDE3F0',
  fontSize: 14.5 * scale,
  lineHeight: 21 * scale,
  flex: 1,
});

const footerWrap = (scale: number): ViewStyle => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingHorizontal: 26 * scale,
  paddingBottom: 28 * scale,
  paddingTop: 14 * scale,
  backgroundColor: 'rgba(2, 8, 23, 0.96)',
  borderTopWidth: 1,
  borderTopColor: NutriColors.divider,
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
