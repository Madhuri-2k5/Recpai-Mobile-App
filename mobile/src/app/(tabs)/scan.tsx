import { useState } from 'react';
import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { FlashIcon, GalleryIcon, UtensilsIcon } from '@/components/icons';

export default function ScanScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);

  const granted = permission?.granted ?? false;

  function startFlow() {
    router.push('/scan-options');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.cameraArea}>
        {granted ? (
          <CameraView
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
          <Pressable style={sideButton(scale)} onPress={startFlow}>
            <GalleryIcon size={26 * scale} color="#FFFFFF" />
            <Text style={sideLabel(scale)}>Gallery</Text>
          </Pressable>

          <Pressable onPress={startFlow} style={({ pressed }) => [shutterOuter(scale), pressed && { opacity: 0.8 }]}>
            <View style={shutterInner(scale)} />
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
    </View>
  );
}

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

const shutterInner = (scale: number): ViewStyle => ({
  width: 62 * scale,
  height: 62 * scale,
  borderRadius: 31 * scale,
  backgroundColor: NutriColors.purple,
  shadowColor: NutriColors.purple,
  shadowOpacity: 0.8,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
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
