import { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import {
  CloseIcon,
  FlashIcon,
  GalleryIcon,
  SparkleIcon,
  UtensilsIcon,
} from '@/components/icons';
import { resetScanFlow, scanFlow, setScanFlow } from '@/lib/scan-flow';

interface SampleFood {
  name: string;
  cuisine: string;
  imageUrl: string;
  detectedItems: string[];
  description: string;
}

const SAMPLE_FOODS: SampleFood[] = [
  {
    name: 'Paneer Tikka with Peppers',
    cuisine: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Paneer', 'Bell peppers', 'Onions', 'Garam masala', 'Yogurt'],
    description: 'Fresh grilled cottage cheese with bell peppers and aromatic Indian spices.',
  },
  {
    name: 'Avocado Toast & Poached Egg',
    cuisine: 'Continental',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Sourdough bread', 'Ripe avocado', 'Eggs', 'Cherry tomatoes', 'Microgreens'],
    description: 'Crisp sourdough topped with smashed avocado, soft poached egg, and seasoning.',
  },
  {
    name: 'Grilled Lemon Herb Chicken',
    cuisine: 'Mediterranean',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Chicken breast', 'Olive oil', 'Lemon', 'Garlic', 'Rosemary'],
    description: 'Tender chicken breast marinated in extra virgin olive oil, herbs, and lemon.',
  },
  {
    name: 'Tofu & Broccoli Stir-Fry',
    cuisine: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Firm tofu', 'Broccoli', 'Soy sauce', 'Ginger', 'Sesame oil'],
    description: 'Crispy pan-fried tofu with fresh broccoli and savoury sesame-ginger glaze.',
  },
  {
    name: 'Loaded Black Bean Tacos',
    cuisine: 'Mexican',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Corn tortillas', 'Black beans', 'Avocado', 'Salsa', 'Cilantro'],
    description: 'Warm corn tortillas with seasoned black beans, fresh pico de gallo, and guacamole.',
  },
  {
    name: 'Classic Penne Pomodoro',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&auto=format&fit=crop&q=80',
    detectedItems: ['Penne pasta', 'San Marzano tomatoes', 'Fresh basil', 'Garlic', 'Parmesan'],
    description: 'Al dente penne in a rich garlic-tomato basil reduction with shaved parmesan.',
  },
];

export default function ScanScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

  const granted = permission?.granted ?? false;

  async function capture() {
    if (capturing) return;
    setCapturing(true);
    try {
      resetScanFlow();
      if (granted && cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.55,
          skipProcessing: true,
        });
        if (photo?.base64) {
          scanFlow.imageBase64 = photo.base64;
          scanFlow.imageUri = photo.uri;
        }
      }
      router.push('/scan-options');
    } catch {
      router.push('/scan-options');
    } finally {
      setCapturing(false);
    }
  }

  function selectSampleFood(sample: SampleFood) {
    resetScanFlow();
    setScanFlow({
      imageUri: sample.imageUrl,
      detectedItems: sample.detectedItems,
      detectedConfidence: 0.96,
      detectedReason: sample.description,
    });
    setGalleryVisible(false);
    router.push('/scan-options');
  }

  function pickWebImage() {
    if (Platform.OS !== 'web') return;
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resetScanFlow();
            const base64 = result.split(',')[1];
            setScanFlow({
              imageUri: result,
              ...(base64 ? { imageBase64: base64 } : {}),
            });
            setGalleryVisible(false);
            router.push('/scan-options');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } catch {
      // ignore
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.cameraArea}>
        {granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            enableTorch={flashOn}
          />
        ) : (
          <View style={styles.permissionBody}>
            <UtensilsIcon size={54 * scale} color={NutriColors.purple} />
            <Text style={permissionTitle(scale)}>Camera access needed</Text>
            <Text style={permissionBody(scale)}>
              Allow camera access to scan your food and get instant recipes.
            </Text>
            <Pressable onPress={requestPermission} style={permissionButton(scale)}>
              <Text style={permissionButtonText(scale)}>Allow access</Text>
            </Pressable>
            <Pressable onPress={() => setGalleryVisible(true)} style={permissionSecondary(scale)}>
              <Text style={permissionSecondaryText(scale)}>Choose from Gallery instead</Text>
            </Pressable>
          </View>
        )}

        {granted ? (
          <>
            <LinearGradient
              colors={['rgba(2, 8, 23, 0.85)', 'transparent']}
              style={topFade(scale)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(2, 8, 23, 0.95)']}
              style={bottomFade(scale)}
            />
            <View style={viewfinder(scale)} pointerEvents="none">
              <View style={corner(scale, 'topLeft')} />
              <View style={corner(scale, 'topRight')} />
              <View style={corner(scale, 'bottomLeft')} />
              <View style={corner(scale, 'bottomRight')} />
            </View>
          </>
        ) : null}

        <View style={controls(scale)} pointerEvents="box-none">
          <Pressable style={sideButton(scale)} onPress={() => setGalleryVisible(true)}>
            <GalleryIcon size={26 * scale} color="#FFFFFF" />
            <Text style={sideLabel(scale)}>Gallery</Text>
          </Pressable>

          <Pressable
            onPress={capture}
            disabled={capturing}
            style={({ pressed }) => [shutterOuter(scale), pressed && { opacity: 0.8 }]}>
            <View style={shutterInner(scale, capturing)} />
          </Pressable>

          <Pressable style={sideButton(scale)} onPress={() => setFlashOn((value) => !value)}>
            <FlashIcon size={26 * scale} color={flashOn ? NutriColors.amber : '#FFFFFF'} filled={flashOn} />
            <Text style={sideLabel(scale)}>Flash</Text>
          </Pressable>
        </View>

        <View style={hintWrap(scale)} pointerEvents="none">
          <Text style={hintTitle(scale)}>Point the camera at your Food</Text>
          <Text style={hintBody(scale)}>
            We&apos;ll analyze it and create a recipe — you pick the cuisine style and servings.
          </Text>
        </View>
      </View>

      {/* Gallery & Sample Food Modal */}
      <Modal
        visible={galleryVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGalleryVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setGalleryVisible(false)} />
          <View style={gallerySheet(scale)}>
            <View style={galleryHeader(scale)}>
              <View>
                <Text style={galleryTitle(scale)}>Choose Food Photo</Text>
                <Text style={gallerySubtitle(scale)}>Select a sample dish or upload your own</Text>
              </View>
              <Pressable onPress={() => setGalleryVisible(false)} style={galleryCloseBtn(scale)}>
                <CloseIcon size={20 * scale} />
              </Pressable>
            </View>

            {Platform.OS === 'web' ? (
              <Pressable onPress={pickWebImage} style={uploadBox(scale)}>
                <GalleryIcon size={24 * scale} color={NutriColors.purple} />
                <Text style={uploadBoxText(scale)}>Upload image from your device</Text>
              </Pressable>
            ) : null}

            <Text style={sampleSectionLabel(scale)}>Preset Food Samples</Text>
            <ScrollView
              style={sampleList(scale)}
              contentContainerStyle={{ paddingBottom: 24 * scale }}
              showsVerticalScrollIndicator={false}>
              {SAMPLE_FOODS.map((sample) => (
                <Pressable
                  key={sample.name}
                  onPress={() => selectSampleFood(sample)}
                  style={sampleCard(scale)}>
                  <Image source={{ uri: sample.imageUrl }} style={sampleImage(scale)} contentFit="cover" />
                  <View style={styles.sampleTextWrap}>
                    <Text style={sampleName(scale)} numberOfLines={1}>
                      {sample.name}
                    </Text>
                    <Text style={sampleDesc(scale)} numberOfLines={2}>
                      {sample.description}
                    </Text>
                    <View style={sampleCuisineChip(scale)}>
                      <SparkleIcon size={12 * scale} color="#D9A8FF" />
                      <Text style={sampleCuisineText(scale)}>{sample.cuisine} cuisine</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalBackdrop: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(1, 5, 15, 0.76)',
  justifyContent: 'flex-end',
};

const styles = {
  root: {
    flex: 1,
    backgroundColor: '#000000',
  } as ViewStyle,
  cameraArea: {
    flex: 1,
    overflow: 'hidden',
  } as ViewStyle,
  camera: {
    flex: 1,
  } as ViewStyle,
  permissionBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 40,
  } as ViewStyle,
  modalDismiss: {
    flex: 1,
  } as ViewStyle,
  sampleTextWrap: {
    flex: 1,
  } as ViewStyle,
};

const topFade = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 140 * scale,
});

const bottomFade = (scale: number): ViewStyle => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 330 * scale,
});

const viewfinder = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: '24%',
  alignSelf: 'center',
  width: 250 * scale,
  height: 250 * scale,
});

const corner = (scale: number, position: string): ViewStyle => {
  const base: ViewStyle = {
    position: 'absolute',
    width: 38 * scale,
    height: 38 * scale,
    borderColor: '#FFFFFF',
  };
  const radius = 6 * scale;
  if (position === 'topLeft') {
    return { ...base, top: 0, left: 0, borderTopWidth: 3.4, borderLeftWidth: 3.4, borderTopLeftRadius: radius };
  }
  if (position === 'topRight') {
    return { ...base, top: 0, right: 0, borderTopWidth: 3.4, borderRightWidth: 3.4, borderTopRightRadius: radius };
  }
  if (position === 'bottomLeft') {
    return { ...base, bottom: 0, left: 0, borderBottomWidth: 3.4, borderLeftWidth: 3.4, borderBottomLeftRadius: radius };
  }
  return { ...base, bottom: 0, right: 0, borderBottomWidth: 3.4, borderRightWidth: 3.4, borderBottomRightRadius: radius };
};

const controls = (scale: number): ViewStyle => ({
  position: 'absolute',
  bottom: 190 * scale,
  left: 0,
  right: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
});

const sideButton = (scale: number): ViewStyle => ({
  alignItems: 'center',
  gap: 7 * scale,
  width: 76 * scale,
  paddingVertical: 12 * scale,
  borderRadius: 16 * scale,
  backgroundColor: 'rgba(10, 25, 46, 0.65)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.14)',
});

const sideLabel = (scale: number): TextStyle => ({
  color: '#D7DCEA',
  fontSize: 12.5 * scale,
  fontWeight: '600',
});

const shutterOuter = (scale: number): ViewStyle => ({
  width: 84 * scale,
  height: 84 * scale,
  borderRadius: 42 * scale,
  borderWidth: 5 * scale,
  borderColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
});

const shutterInner = (scale: number, capturing: boolean): ViewStyle => ({
  width: 62 * scale,
  height: 62 * scale,
  borderRadius: 31 * scale,
  backgroundColor: NutriColors.purple,
  opacity: capturing ? 0.5 : 1,
});

const hintWrap = (scale: number): ViewStyle => ({
  position: 'absolute',
  bottom: 78 * scale,
  left: 0,
  right: 0,
  alignItems: 'center',
  paddingHorizontal: 40 * scale,
});

const hintTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 21 * scale,
  fontWeight: '700',
});

const hintBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  textAlign: 'center',
  lineHeight: 20 * scale,
  marginTop: 8 * scale,
});

const permissionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 22 * scale,
  fontWeight: '700',
});

const permissionBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14.5 * scale,
  textAlign: 'center',
  lineHeight: 21 * scale,
});

const permissionButton = (scale: number): ViewStyle => ({
  marginTop: 10 * scale,
  paddingHorizontal: 26 * scale,
  paddingVertical: 14 * scale,
  borderRadius: 16 * scale,
  backgroundColor: NutriColors.purple,
});

const permissionButtonText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const permissionSecondary = (scale: number): ViewStyle => ({
  marginTop: 6 * scale,
  paddingHorizontal: 20 * scale,
  paddingVertical: 10 * scale,
});

const permissionSecondaryText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 14 * scale,
  fontWeight: '600',
});

const gallerySheet = (scale: number): ViewStyle => ({
  backgroundColor: '#0D1426',
  borderTopLeftRadius: 28 * scale,
  borderTopRightRadius: 28 * scale,
  paddingHorizontal: 22 * scale,
  paddingTop: 22 * scale,
  maxHeight: '78%',
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const galleryHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16 * scale,
});

const galleryTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
});

const gallerySubtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  marginTop: 2 * scale,
});

const galleryCloseBtn = (scale: number): ViewStyle => ({
  width: 36 * scale,
  height: 36 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  alignItems: 'center',
  justifyContent: 'center',
});

const uploadBox = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10 * scale,
  paddingVertical: 14 * scale,
  borderRadius: 16 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.35)',
  marginBottom: 16 * scale,
});

const uploadBoxText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 14 * scale,
  fontWeight: '600',
});

const sampleSectionLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
  marginBottom: 12 * scale,
});

const sampleList = (scale: number): ViewStyle => ({
  maxHeight: 380 * scale,
});

const sampleCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  padding: 12 * scale,
  borderRadius: 16 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  marginBottom: 10 * scale,
});

const sampleImage = (scale: number): ImageStyle => ({
  width: 68 * scale,
  height: 68 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
});

const sampleName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const sampleDesc = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12 * scale,
  lineHeight: 17 * scale,
  marginTop: 2 * scale,
});

const sampleCuisineChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5 * scale,
  marginTop: 6 * scale,
});

const sampleCuisineText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 11.5 * scale,
  fontWeight: '600',
});
