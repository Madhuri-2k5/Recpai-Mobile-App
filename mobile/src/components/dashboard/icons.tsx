import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function SignalIcon({ height, color = '#FFFFFF' }: { height: number; color?: string }) {
  const w = height * 1.15;
  return (
    <Svg width={w} height={height} viewBox="0 0 18 12" fill="none">
      <Rect x="0" y="7.5" width="3.2" height="4.5" rx="1" fill={color} />
      <Rect x="4.7" y="5" width="3.2" height="7" rx="1" fill={color} />
      <Rect x="9.4" y="2.5" width="3.2" height="9.5" rx="1" fill={color} />
      <Rect x="14.1" y="0" width="3.2" height="12" rx="1" fill={color} />
    </Svg>
  );
}

export function WifiIcon({ height, color = '#FFFFFF' }: { height: number; color?: string }) {
  const w = height * 1.31;
  return (
    <Svg width={w} height={height} viewBox="0 0 17 13" fill="none">
      <Path
        d="M1.2 4.4C5.4 0.6 11.6 0.6 15.8 4.4"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <Path
        d="M3.9 7.3C6.7 4.9 10.3 4.9 13.1 7.3"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <Path d="M8.5 11.6L8.5 11.6" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
    </Svg>
  );
}

export function BatteryIcon({ height, color = '#FFFFFF' }: { height: number; color?: string }) {
  const w = height * 2.1;
  return (
    <Svg width={w} height={height} viewBox="0 0 27 13" fill="none">
      <Rect
        x="0.75"
        y="0.75"
        width="22.5"
        height="11.5"
        rx="3.5"
        stroke={color}
        strokeOpacity="0.45"
        strokeWidth="1.1"
      />
      <Rect x="2.4" y="2.4" width="14.5" height="8.2" rx="2" fill={color} />
      <Path
        d="M25.2 4.5V8.5C26.3 8.1 26.9 7.4 26.9 6.5C26.9 5.6 26.3 4.9 25.2 4.5Z"
        fill={color}
        fillOpacity="0.45"
      />
    </Svg>
  );
}

export function FlameIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="flameGrad" x1="7" y1="3" x2="17" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#D07BFF" />
          <Stop offset="0.55" stopColor="#A64BFF" />
          <Stop offset="1" stopColor="#7A2BF0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12.3 1.4C12.9 4.7 12 7.1 10.3 9C8.4 11.1 5.9 13.1 5.9 15.9C5.9 19.6 8.7 22.5 12.3 22.5C15.9 22.5 18.7 19.6 18.7 15.9C18.7 13.4 17.6 11.3 16.2 9.6C16.5 11.2 15.9 12.5 14.8 13.3C15.1 10.4 14.2 6.3 12.3 1.4Z"
        fill="url(#flameGrad)"
      />
    </Svg>
  );
}

export function CalendarIcon({ size, color = '#FFFFFF' }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect
        x="2.4"
        y="4"
        width="17.2"
        height="15.6"
        rx="3.4"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path d="M2.6 9H19.4" stroke={color} strokeWidth="1.8" />
      <Path
        d="M7 2.2V5.6M15 2.2V5.6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="7.4" cy="13" r="1.15" fill={color} />
      <Circle cx="11" cy="13" r="1.15" fill={color} />
      <Circle cx="14.6" cy="13" r="1.15" fill={color} />
    </Svg>
  );
}

export function ChevronRightIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.4 4.2L13.2 10L7.4 15.8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HouseIcon({ size, filled, color }: { size: number; filled: boolean; color: string }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M11.4 2.6C11.75 2.32 12.25 2.32 12.6 2.6L21 9.2V20.4C21 21.06 20.46 21.6 19.8 21.6H14.9V15.2C14.9 13.87 13.63 12.9 12 12.9C10.37 12.9 9.1 13.87 9.1 15.2V21.6H4.2C3.54 21.6 3 21.06 3 20.4V9.2L11.4 2.6Z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.9 9.4L12 3.1L20.1 9.4V20.4C20.1 20.84 19.74 21.2 19.3 21.2H14.5V15.2C14.5 13.71 13.28 12.5 11.8 12.5H12.2C10.72 12.5 9.5 13.71 9.5 15.2V21.2H4.7C4.26 21.2 3.9 20.84 3.9 20.4V9.4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ScanIcon({ size, color }: { size: number; color: string }) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.6 3.4H5.2C4.21 3.4 3.4 4.21 3.4 5.2V8.6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M15.4 3.4H18.8C19.79 3.4 20.6 4.21 20.6 5.2V8.6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M8.6 20.6H5.2C4.21 20.6 3.4 19.79 3.4 18.8V15.4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M15.4 20.6H18.8C19.79 20.6 20.6 19.79 20.6 18.8V15.4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M7.6 12H16.4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CommunityIcon({ size, color }: { size: number; color: string }) {
  const sw = 1.8;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8.6" r="3.3" stroke={color} strokeWidth={sw} />
      <Path
        d="M2.9 19.6C3.4 16.5 6 14.4 9 14.4C12 14.4 14.6 16.5 15.1 19.6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M15.4 5.7C17.1 5.9 18.4 7.3 18.4 9.1C18.4 10.9 17.1 12.3 15.4 12.5"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M17.3 14.9C19.5 15.5 21 17.2 21.3 19.6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PersonIcon({ size, color }: { size: number; color: string }) {
  const sw = 1.8;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7.6" r="3.9" stroke={color} strokeWidth={sw} />
      <Path
        d="M4.6 20.4C5.2 16.6 8.3 14.1 12 14.1C15.7 14.1 18.8 16.6 19.4 20.4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StreakNavIcon({
  size,
  filled,
  color,
}: {
  size: number;
  filled: boolean;
  color: string;
}) {
  if (filled) {
    return <FlameIcon size={size} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.3 1.4C12.9 4.7 12 7.1 10.3 9C8.4 11.1 5.9 13.1 5.9 15.9C5.9 19.6 8.7 22.5 12.3 22.5C15.9 22.5 18.7 19.6 18.7 15.9C18.7 13.4 17.6 11.3 16.2 9.6C16.5 11.2 15.9 12.5 14.8 13.3C15.1 10.4 14.2 6.3 12.3 1.4Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NavIcon({
  name,
  size,
  color,
  active,
}: {
  name: 'home' | 'streak' | 'scan' | 'community' | 'profile';
  size: number;
  color: string;
  active: boolean;
}) {
  switch (name) {
    case 'home':
      return <HouseIcon size={size} filled={active} color={color} />;
    case 'streak':
      return <StreakNavIcon size={size} filled={active} color={color} />;
    case 'scan':
      return <ScanIcon size={size} color={color} />;
    case 'community':
      return <CommunityIcon size={size} color={color} />;
    case 'profile':
      return <PersonIcon size={size} color={color} />;
  }
}
