import { useState } from 'react';
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
  ChevronDownIcon,
  CloseIcon,
  FatIcon,
  FlameTileIcon,
  IngredientDotIcon,
  ProteinIcon,
} from '@/components/icons';
import { getRecipeById } from '@/data/recipesMockData';

export default function RecipeDetailScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const recipe = getRecipeById(params.id ?? '') ?? getRecipeById('grilled-chicken-bowl')!;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 * scale }}>
        <View style={heroWrap}>
          <Image source={recipe.image} style={heroImage(scale)} contentFit="cover" />
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
          <Text style={title(scale)}>{recipe.name}</Text>

          <View style={tagsRow(scale)}>
            {recipe.tags.map((tag, index) => (
              <View key={tag} style={tagChip(scale, index)}>
                <Text style={tagText(scale, index)}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={tilesRow(scale)}>
            <View style={tile(scale)}>
              <FlameTileIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{recipe.kcal}</Text>
              <Text style={tileUnit(scale)}>kcal</Text>
            </View>
            <View style={tile(scale)}>
              <ProteinIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{recipe.protein}g</Text>
              <Text style={tileUnit(scale)}>protein</Text>
            </View>
            <View style={tile(scale)}>
              <CarbsIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{recipe.carbs}g</Text>
              <Text style={tileUnit(scale)}>carbs</Text>
            </View>
            <View style={tile(scale)}>
              <FatIcon size={26 * scale} />
              <Text style={tileValue(scale)}>{recipe.fat}g</Text>
              <Text style={tileUnit(scale)}>fat</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIngredientsOpen((open) => !open)}
            style={ingredientsHeader(scale)}>
            <Text style={sectionTitle(scale)}>Ingredients</Text>
            <View style={chevronWrap(ingredientsOpen, scale)}>
              <ChevronDownIcon size={20 * scale} color={NutriColors.textDim} />
            </View>
          </Pressable>

          {ingredientsOpen ? (
            <View style={listCard(scale)}>
              {recipe.ingredients.map((ingredient, index) => (
                <View
                  key={ingredient.name}
                  style={ingredientRow(scale, index === recipe.ingredients.length - 1)}>
                  <IngredientDotIcon size={30 * scale} />
                  <Text style={ingredientName(scale)}>
                    {ingredient.name}{' '}
                    <Text style={ingredientQty(scale)}>
                      ({ingredient.quantity} {ingredient.unit})
                    </Text>
                  </Text>
                  <Text style={ingredientKcal(scale)}>{ingredient.kcal} kcal</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={footerWrap(scale)} pointerEvents="box-none">
        {saved ? (
          <View style={savedBadge(scale)}>
            <CheckCircleIcon size={22 * scale} circleColor={NutriColors.green} />
            <Text style={savedBadgeText(scale)}>Saved to your recipes</Text>
          </View>
        ) : (
          <GradientButton label="Save Recipe" onPress={() => setSaved(true)} />
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
};

const heroWrap: ViewStyle = {
  alignSelf: 'stretch',
};

const heroImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 380 * scale,
});

const heroButtons = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20 * scale,
  paddingTop: 16 * scale,
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
  paddingHorizontal: 26 * scale,
  marginTop: 24 * scale,
});

const title = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 30 * scale,
  fontWeight: '700',
});

const tagsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
  marginTop: 14 * scale,
});

const tagChip = (scale: number, index: number): ViewStyle => ({
  paddingHorizontal: 14 * scale,
  paddingVertical: 8 * scale,
  borderRadius: 11 * scale,
  backgroundColor:
    index % 2 === 0 ? 'rgba(183, 79, 245, 0.16)' : 'rgba(0, 215, 197, 0.13)',
  borderWidth: 1,
  borderColor:
    index % 2 === 0 ? 'rgba(183, 79, 245, 0.45)' : 'rgba(0, 215, 197, 0.4)',
});

const tagText = (scale: number, index: number): TextStyle => ({
  color: index % 2 === 0 ? '#D9A8FF' : NutriColors.teal,
  fontSize: 13.5 * scale,
  fontWeight: '700',
});

const tilesRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
  marginTop: 22 * scale,
});

const tile = (scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 16 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const tileValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
  marginTop: 10 * scale,
});

const tileUnit = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12 * scale,
  marginTop: 3,
});

const ingredientsHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 30 * scale,
  marginBottom: 14 * scale,
});

const chevronWrap = (open: boolean, scale: number): ViewStyle => ({
  width: 34 * scale,
  height: 34 * scale,
  borderRadius: 11 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  transform: [{ rotate: open ? '180deg' : '0deg' }],
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
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

const ingredientKcal = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '600',
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
