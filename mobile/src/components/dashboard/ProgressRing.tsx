import { useId } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface RingSegment {
  colors: [string, string] | string;
  startDeg: number;
  sweepDeg: number;
}

type ProgressRingProps = ViewProps & {
  size: number;
  strokeWidth: number;
  segments: RingSegment[];
  trackColor?: string;
  lineCap?: 'butt' | 'round';
  children?: React.ReactNode;
};

function polarPoint(cx: number, cy: number, r: number, degFromTop: number) {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function ProgressRing({
  size,
  strokeWidth,
  segments,
  trackColor,
  lineCap = 'butt',
  children,
  ...rest
}: ProgressRingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={[{ width: size, height: size }, rest.style]} {...rest}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          {segments.map((segment, index) => {
            if (typeof segment.colors === 'string' || segment.sweepDeg >= 359.5) return null;
            const start = polarPoint(cx, cy, r, segment.startDeg);
            const end = polarPoint(cx, cy, r, segment.startDeg + segment.sweepDeg);
            return (
              <LinearGradient
                key={`grad-${index}`}
                id={`${uid}-ring-grad-${index}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={segment.colors[0]} />
                <Stop offset="1" stopColor={segment.colors[1]} />
              </LinearGradient>
            );
          })}
        </Defs>
        {trackColor ? (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : null}
        {segments.map((segment, index) => {
          const solid = typeof segment.colors === 'string' ? segment.colors : segment.colors[0];
          const gradient = typeof segment.colors === 'string' || segment.sweepDeg >= 359.5;
          const dashLength = (Math.min(segment.sweepDeg, 359.9) / 360) * circumference;
          return (
            <Circle
              key={`seg-${index}`}
              cx={cx}
              cy={cy}
              r={r}
              stroke={gradient ? solid : `url(#${uid}-ring-grad-${index})`}
              strokeWidth={strokeWidth}
              strokeLinecap={lineCap}
              fill="none"
              strokeDasharray={`${dashLength} ${circumference - dashLength + 1}`}
              strokeDashoffset={(90 - segment.startDeg) * (circumference / 360)}
            />
          );
        })}
      </Svg>
      {children ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
