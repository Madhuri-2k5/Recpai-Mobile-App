import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { GradientButton } from '@/components/gradient-button';
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  SparkleIcon,
  UtensilsIcon,
} from '@/components/icons';
import { api, type Assessment } from '@/lib/api';
import { scanFlow } from '@/lib/scan-flow';

const CUISINES = [
  'Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'Mediterranean',
  'Continental',
];

export default function ScanOptionsScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [servings, setServings] = useState(2);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [items, setItems] = useState<string[]>(scanFlow.detectedItems || []);
  const [newItem, setNewItem] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (scanFlow.imageBase64 && !assessment) {
        setAssessing(true);
        api
          .detect(scanFlow.imageBase64)
          .then((payload) => {
            if (!active) return;
            setAssessment(payload.assessment);
            setItems(payload.assessment.detectedItems || []);
            scanFlow.detectedItems = payload.assessment.detectedItems;
            scanFlow.detectedReason = payload.assessment.reason;
            scanFlow.detectedConfidence = payload.assessment.confidence;
          })
          .catch(() => {
            if (active) setAssessment(null);
          })
          .finally(() => {
            if (active) setAssessing(false);
          });
      } else if (scanFlow.detectedItems && scanFlow.detectedItems.length > 0) {
        setItems(scanFlow.detectedItems);
      }
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  function removeItem(index: number) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      scanFlow.detectedItems = next;
      return next;
    });
  }

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems((prev) => {
      const next = [...prev, trimmed];
      scanFlow.detectedItems = next;
      return next;
    });
    setNewItem('');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 * scale }}>
        <View style={headerRow(scale)}>
          <Pressable onPress={() => router.back()} style={backButton(scale)}>
            <ArrowLeftIcon size={24 * scale} />
          </Pressable>
          <Text style={headerTitle(scale)}>Recipe Setup</Text>
          <View style={backButton(scale)} />
        </View>

        <View style={detectedCard(scale)}>
          {scanFlow.imageUri ? (
            <Image source={{ uri: scanFlow.imageUri }} style={detectedImage(scale)} contentFit="cover" />
          ) : (
            <View style={[detectedImage(scale), detectedPlaceholder(scale)]}>
              <UtensilsIcon size={30 * scale} color={NutriColors.purple} />
            </View>
          )}
          <View style={styles.detectedText}>
            <View style={detectedChip(scale)}>
              <SparkleIcon size={13 * scale} color={NutriColors.teal} />
              <Text style={detectedChipText(scale)}>
                {assessing ? 'AI Scanning…' : assessment || items.length > 0 ? 'AI Detected' : 'Manual Mode'}
              </Text>
            </View>
            {assessing ? (
              <ActivityIndicator color={NutriColors.purple} style={{ marginTop: 10 * scale }} />
            ) : (
              <>
                <Text style={detectedName(scale)} numberOfLines={2}>
                  {items.length > 0 ? items.slice(0, 4).join(', ') : 'Add ingredients or let AI detect them'}
                </Text>
                {assessment || scanFlow.detectedConfidence ? (
                  <Text style={detectedConfidence(scale)}>
                    Confidence: {Math.round(((assessment?.confidence ?? scanFlow.detectedConfidence) ?? 0.95) * 100)}%
                  </Text>
                ) : null}
              </>
            )}
          </View>
        </View>

        {/* Ingredients Tags & Manual Add */}
        <Text style={sectionLabel(scale)}>Detected &amp; Added Ingredients</Text>
        <View style={ingredientsTagWrap(scale)}>
          {items.map((item, index) => (
            <View key={`${item}-${index}`} style={ingredientTag(scale)}>
              <Text style={ingredientTagText(scale)}>{item}</Text>
              <Pressable onPress={() => removeItem(index)} style={removeTagBtn(scale)}>
                <CloseIcon size={14 * scale} color="#D9A8FF" />
              </Pressable>
            </View>
          ))}
          {items.length === 0 ? (
            <Text style={noIngredientsText(scale)}>No ingredients added yet. Type below to add.</Text>
          ) : null}
        </View>

        <View style={addIngredientRow(scale)}>
          <TextInput
            style={addIngredientInput(scale)}
            placeholder="Add ingredient (e.g. Garlic, Paneer)…"
            placeholderTextColor={NutriColors.textFaint}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
            returnKeyType="done"
          />
          <Pressable onPress={addItem} style={addIngredientButton(scale)}>
            <PlusIcon size={18 * scale} />
            <Text style={addIngredientButtonText(scale)}>Add</Text>
          </Pressable>
        </View>

        <Text style={sectionLabel(scale)}>Select Cuisine Style</Text>
        <View style={chipGrid(scale)}>
          {CUISINES.map((item) => {
            const selected = cuisine === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCuisine(item)}
                style={({ pressed }) => [
                  chip(scale, selected),
                  pressed && { opacity: 0.8 },
                ]}>
                {selected ? (
                  <LinearGradient
                    colors={['#B74FF5', '#753AFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 * scale }]}
                  />
                ) : null}
                <Text style={[chipText(scale, selected), selected && styles.chipTextSelected]}>
                  {item}
                </Text>
                {selected ? <CheckIcon size={15 * scale} color="#FFFFFF" /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={sectionLabel(scale)}>Servings (People to cook for)</Text>
        <View style={servingsCard(scale)}>
          <View style={servingsIconWrap(scale)}>
            <UtensilsIcon size={26 * scale} color={NutriColors.purple} />
          </View>
          <View style={styles.servingsText}>
            <Text style={servingsValue(scale)}>{servings}</Text>
            <Text style={servingsCaption(scale)}>people</Text>
          </View>
          <View style={stepperRow(scale)}>
            <Pressable
              onPress={() => setServings((value) => Math.max(1, value - 1))}
              style={stepperButton(scale, servings <= 1)}>
              <MinusIcon size={18 * scale} color={servings <= 1 ? NutriColors.textFaint : '#FFFFFF'} />
            </Pressable>
            <Pressable
              onPress={() => setServings((value) => Math.min(12, value + 1))}
              style={stepperButton(scale, servings >= 12)}>
              <PlusIcon size={18 * scale} color={servings >= 12 ? NutriColors.textFaint : '#FFFFFF'} />
            </Pressable>
          </View>
        </View>

        <View style={footerWrap(scale)}>
          <GradientButton
            label="Next"
            disabled={!cuisine}
            onPress={() =>
              router.push({
                pathname: '/scan-recipe',
                params: { cuisine: cuisine ?? '', servings: String(servings) },
              })
            }
          />
          {!cuisine ? (
            <Text style={footerHint(scale)}>Pick a cuisine style to continue</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  detectedText: {
    flex: 1,
  } as ViewStyle,
  chipTextSelected: {
    color: '#FFFFFF',
  } as TextStyle,
  servingsText: {
    flex: 1,
  } as ViewStyle,
};

const headerRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 26 * scale,
  marginTop: 18 * scale,
});

const backButton = (scale: number): ViewStyle => ({
  width: 46 * scale,
  height: 46 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const headerTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 18 * scale,
  fontWeight: '700',
});

const detectedCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 22 * scale,
  padding: 16 * scale,
  borderRadius: 22 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const detectedImage = (scale: number): ImageStyle => ({
  width: 74 * scale,
  height: 74 * scale,
  borderRadius: 18 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
});

const detectedPlaceholder = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
});

const detectedChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5 * scale,
  alignSelf: 'flex-start',
  paddingHorizontal: 9 * scale,
  paddingVertical: 3.5 * scale,
  borderRadius: 9 * scale,
  backgroundColor: 'rgba(0, 215, 197, 0.12)',
  marginBottom: 6 * scale,
});

const detectedChipText = (scale: number): TextStyle => ({
  color: NutriColors.teal,
  fontSize: 11.5 * scale,
  fontWeight: '700',
});

const detectedName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const detectedConfidence = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12 * scale,
  marginTop: 4 * scale,
});

const sectionLabel = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
  marginHorizontal: 26 * scale,
  marginTop: 24 * scale,
  marginBottom: 12 * scale,
});

const ingredientsTagWrap = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8 * scale,
  marginHorizontal: 26 * scale,
});

const ingredientTag = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8 * scale,
  paddingHorizontal: 12 * scale,
  paddingVertical: 7 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.35)',
});

const ingredientTagText = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 13.5 * scale,
  fontWeight: '600',
});

const removeTagBtn = (scale: number): ViewStyle => ({
  width: 18 * scale,
  height: 18 * scale,
  borderRadius: 9 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  alignItems: 'center',
  justifyContent: 'center',
});

const noIngredientsText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
});

const addIngredientRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 12 * scale,
});

const addIngredientInput = (scale: number): TextStyle => ({
  flex: 1,
  height: 46 * scale,
  borderRadius: 14 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 14 * scale,
  color: '#FFFFFF',
  fontSize: 14 * scale,
});

const addIngredientButton = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  height: 46 * scale,
  paddingHorizontal: 16 * scale,
  borderRadius: 14 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.22)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const addIngredientButtonText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 14 * scale,
  fontWeight: '700',
});

const chipGrid = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10 * scale,
  paddingHorizontal: 26 * scale,
});

const chip = (scale: number, selected: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6 * scale,
  paddingHorizontal: 16 * scale,
  paddingVertical: 12 * scale,
  borderRadius: 14 * scale,
  backgroundColor: selected ? 'transparent' : NutriColors.card,
  borderWidth: 1,
  borderColor: selected ? NutriColors.purple : NutriColors.borderMuted,
  overflow: 'hidden',
});

const chipText = (scale: number, selected: boolean): TextStyle => ({
  color: selected ? '#FFFFFF' : NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: selected ? '700' : '600',
});

const servingsCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16 * scale,
  marginHorizontal: 26 * scale,
  padding: 16 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const servingsIconWrap = (scale: number): ViewStyle => ({
  width: 48 * scale,
  height: 48 * scale,
  borderRadius: 16 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  alignItems: 'center',
  justifyContent: 'center',
});

const servingsValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 22 * scale,
  fontWeight: '800',
});

const servingsCaption = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
});

const stepperRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
});

const stepperButton = (scale: number, disabled: boolean): ViewStyle => ({
  width: 42 * scale,
  height: 42 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: disabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(183, 79, 245, 0.18)',
  borderWidth: 1,
  borderColor: disabled ? NutriColors.borderMuted : 'rgba(183, 79, 245, 0.45)',
});

const footerWrap = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  marginTop: 30 * scale,
});

const footerHint = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  textAlign: 'center',
  marginTop: 10 * scale,
});
