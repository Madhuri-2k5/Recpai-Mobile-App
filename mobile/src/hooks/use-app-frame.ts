import { useWindowDimensions } from 'react-native';

import { REFERENCE_WIDTH } from '@/constants/nutri';

export function useAppFrame() {
  const { width, height } = useWindowDimensions();
  const isWideViewport = width >= 700;
  const scale = isWideViewport
    ? Math.min(1, (height - 24) / (1080 + 48))
    : Math.min(1.1, Math.max(0.5, width / REFERENCE_WIDTH));
  const frameWidth = isWideViewport ? REFERENCE_WIDTH * scale : width;

  return { scale, frameWidth, isWideViewport };
}
