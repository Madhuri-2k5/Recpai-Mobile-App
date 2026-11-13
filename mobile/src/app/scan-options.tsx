import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
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
      }
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const detectedLabel = assessment?.detectedItems?.length
    ? assessment.detectedItems.slice(0, 4).join(', ')
    : 'Point your camera at food to detect ingredients';

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
                {assessing ? 'AI Scanning…' : assessment ? 'AI Detected' : 'Manual Mode'}
              </Text>
            </View>
            {assessing ? (
              <ActivityIndicator color={NutriColors.purple} style={{ marginTop: 10 * scale }} />
            ) : (
              <>
                <Text style={detectedName(scale)} numberOfLines={2}>
                  {detectedLabel}
                </Text>
                {assessment ? (
                  <Text style={detectedConfidence(scale)}>
                    Confidence: {Math.round((assessment.confidence ?? 0) * 100)}%
                  </Text>
                ) : null}
              </>
            )}
          </View>
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

        <Text style={sectionLabel(scale)}>Servings</Text>
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
  fontSize: 20 * scale,
  fontWeight: '700',
});

const detectedCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 22 * scale,
  padding: 14 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: 'rgba(22, 139, 255, 0.4)',
});

const detectedImage = (scale: number): ImageStyle => ({
  width: 84 * scale,
  height: 84 * scale,
  borderRadius: 14 * scale,
});

const detectedPlaceholder = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.4)',
});

const detectedChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  alignSelf: 'flex-start',
  paddingHorizontal: 10 * scale,
  paddingVertical: 4 * scale,
  borderRadius: 9 * scale,
  backgroundColor: 'rgba(0, 215, 197, 0.13)',
});

const detectedChipText = (scale: number): TextStyle => ({
  color: NutriColors.teal,
  fontSize: 11.5 * scale,
  fontWeight: '700',
});

const detectedName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17.5 * scale,
  fontWeight: '700',
  marginTop: 8 * scale,
});

const detectedConfidence = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  marginTop: 4 * scale,
});

const sectionLabel = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 18 * scale,
  fontWeight: '700',
  marginTop: 28 * scale,
  paddingHorizontal: 26 * scale,
});

const chipGrid = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10 * scale,
  paddingHorizontal: 26 * scale,
  marginTop: 14 * scale,
});

const chip = (scale: number, selected: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7 * scale,
  paddingHorizontal: 16 * scale,
  paddingVertical: 11 * scale,
  borderRadius: 14 * scale,
  backgroundColor: selected ? 'transparent' : NutriColors.card,
  borderWidth: 1.4,
  borderColor: selected ? NutriColors.purple : NutriColors.borderMuted,
  overflow: 'hidden',
});

const chipText = (scale: number, selected: boolean): TextStyle => ({
  color: selected ? '#FFFFFF' : NutriColors.textDim,
  fontSize: 14.5 * scale,
  fontWeight: '600',
});

const servingsCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 14 * scale,
  padding: 16 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const servingsIconWrap = (scale: number): ViewStyle => ({
  width: 48 * scale,
  height: 48 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
});

const servingsValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 26 * scale,
  fontWeight: '700',
  lineHeight: 30 * scale,
});

const servingsCaption = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
});

const stepperRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
});

const stepperButton = (scale: number, disabled: boolean): ViewStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: disabled ? NutriColors.track : 'rgba(183, 79, 245, 0.16)',
  borderWidth: 1,
  borderColor: disabled ? NutriColors.borderMuted : 'rgba(183, 79, 245, 0.5)',
});

const footerWrap = (scale: number): ViewStyle => ({
  marginTop: 32 * scale,
  paddingHorizontal: 26 * scale,
  gap: 12 * scale,
});

const footerHint = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 13 * scale,
  textAlign: 'center',
});
