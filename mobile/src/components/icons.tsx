import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type IconProps = {
  size: number;
  color?: string;
};

export function ArrowLeftIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.6 5.2L8 12L14.6 18.8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChevronDownIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.2 9L12 15.8L18.8 9"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5L10 17.5L19 7.5"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon({
  size,
  circleColor = '#8B5CF6',
  checkColor = '#FFFFFF',
}: {
  size: number;
  circleColor?: string;
  checkColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10.4" fill={circleColor} />
      <Path
        d="M7.6 12.4L10.6 15.4L16.4 9.2"
        stroke={checkColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StarIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.2L14.9 8.4L21.7 9.3L16.7 14L18 20.8L12 17.4L6 20.8L7.3 14L2.3 9.3L9.1 8.4L12 2.2Z" />
    </Svg>
  );
}

export function HeartIcon({ size, color = '#FFFFFF', filled }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21C11.6 21 11.2 20.85 10.9 20.58C9.7 19.55 3 13.7 3 8.9C3 5.9 5.35 3.5 8.28 3.5C9.8 3.5 11.16 4.16 12 5.24C12.84 4.16 14.2 3.5 15.72 3.5C18.65 3.5 21 5.9 21 8.9C21 13.7 14.3 19.55 13.1 20.58C12.8 20.85 12.4 21 12 21Z" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.2C11.7 20.2 11.4 20.1 11.2 19.9C9.9 18.8 3 12.9 3 8.6C3 5.5 5.4 3.1 8.4 3.1C10 3.1 11.4 3.8 12 4.9C12.6 3.8 14 3.1 15.6 3.1C18.6 3.1 21 5.5 21 8.6C21 12.9 14.1 18.8 12.8 19.9C12.6 20.1 12.3 20.2 12 20.2Z"
        stroke={color}
        strokeWidth="1.9"
      />
    </Svg>
  );
}

export function CommentIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.2 11.4C20.2 16 16.5 19.2 12 19.2C10.8 19.2 9.7 19 8.7 18.6L4.2 20L5.6 15.9C4.6 14.7 3.8 13.2 3.8 11.4C3.8 6.8 7.5 3.6 12 3.6C16.5 3.6 20.2 6.8 20.2 11.4Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.2 3.8L20.4 10.6C20.8 11 20.8 11.5 20.4 11.9L13.2 18.7C12.6 19.3 11.6 18.9 11.6 18V14.4C6.5 14.4 4 16.4 3.6 19.9C2.3 12.9 6.3 9.2 11.6 9V5.4C11.6 4.5 12.6 4.1 13.2 3.8Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BookmarkIcon({ size, color = '#FFFFFF', filled }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M6.4 3.2H17.6C18.5 3.2 19.2 3.9 19.2 4.8V20.8L12 16.2L4.8 20.8V4.8C4.8 3.9 5.5 3.2 6.4 3.2Z" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.4 3.2H17.6C18.5 3.2 19.2 3.9 19.2 4.8V20.8L12 16.2L4.8 20.8V4.8C4.8 3.9 5.5 3.2 6.4 3.2Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ClockIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.8" stroke={color} strokeWidth="1.9" />
      <Path
        d="M12 7.2V12L15.2 14"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GalleryIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.2" y="4.4" width="17.6" height="15.2" rx="3.2" stroke={color} strokeWidth="1.9" />
      <Circle cx="8.6" cy="9.6" r="1.7" fill={color} />
      <Path
        d="M3.6 17.2L8.8 12.4L12.6 15.8L16.4 11.4L20.4 15.4"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlashIcon({ size, color = '#FFFFFF', filled }: IconProps & { filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M13.4 2.2L4.8 13.4H11L9.8 21.8L19.2 9.8H12.6L13.4 2.2Z" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.4 2.2L4.8 13.4H11L9.8 21.8L19.2 9.8H12.6L13.4 2.2Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GearIcon({ size, color = '#FFFFFF' }: IconProps) {
  const sw = 1.8;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3.1" stroke={color} strokeWidth={sw} />
      <Path
        d="M12 2.8L13 5.2C13.8 5.4 14.5 5.7 15.2 6.1L17.7 5.2L19.4 7.4L18.2 9.7C18.5 10.4 18.7 11.2 18.8 12L21 13.1V16L18.6 16.6C18.3 17.3 17.9 18 17.4 18.6L17.9 21.1L15.4 22.3L13.6 20.5C12.9 20.6 12.1 20.6 11.4 20.5L9.6 22.3L7.1 21.1L7.6 18.6C7.1 18 6.7 17.3 6.4 16.6L4 16V13.1L6.2 12C6.3 11.2 6.5 10.4 6.8 9.7L5.6 7.4L7.3 5.2L9.8 6.1C10.5 5.7 11.2 5.4 12 5.2L13 2.8H12Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlameTileIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="flameTileGrad" x1="7" y1="3" x2="17" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF7A59" />
          <Stop offset="1" stopColor="#E8384F" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12.3 1.4C12.9 4.7 12 7.1 10.3 9C8.4 11.1 5.9 13.1 5.9 15.9C5.9 19.6 8.7 22.5 12.3 22.5C15.9 22.5 18.7 19.6 18.7 15.9C18.7 13.4 17.6 11.3 16.2 9.6C16.5 11.2 15.9 12.5 14.8 13.3C15.1 10.4 14.2 6.3 12.3 1.4Z"
        fill="url(#flameTileGrad)"
      />
    </Svg>
  );
}

export function ProteinIcon({ size, color = '#B78BFF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2.6" y="9.4" width="3.6" height="5.2" rx="1.6" stroke={color} strokeWidth={sw} />
      <Rect x="17.8" y="9.4" width="3.6" height="5.2" rx="1.6" stroke={color} strokeWidth={sw} />
      <Path d="M6.2 10.8H17.8V13.2H6.2V10.8Z" stroke={color} strokeWidth={sw} />
    </Svg>
  );
}

export function CarbsIcon({ size, color = '#00D7C5' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.2C15.2 6.4 16.9 9.6 16.9 12.9C16.9 16.9 14.8 19.6 12 19.6C9.2 19.6 7.1 16.9 7.1 12.9C7.1 9.6 8.8 6.4 12 3.2Z"
        stroke={color}
        strokeWidth={sw}
      />
      <Path d="M12 9.2V19.4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function FatIcon({ size, color = '#FFAC38' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.8C15.8 7.8 17.8 11.3 17.8 14.2C17.8 18.1 15.2 21 12 21C8.8 21 6.2 18.1 6.2 14.2C6.2 11.3 8.2 7.8 12 2.8Z"
        stroke={color}
        strokeWidth="1.9"
      />
    </Svg>
  );
}

export function CrownIcon({ size, color = '#FFD76B' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 7.6L7.4 11L12 4.4L16.6 11L21 7.6L19.4 18.2H4.6L3 7.6Z" />
      <Rect x="4.6" y="19.4" width="14.8" height="2.2" rx="1.1" />
    </Svg>
  );
}

export function TrophyIcon({ size, color = '#FFAC38' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.4 4.2H16.6V10.2C16.6 13 14.6 15.2 12 15.2C9.4 15.2 7.4 13 7.4 10.2V4.2Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <Path
        d="M7.4 5.8H4.4V7.6C4.4 9.5 5.7 11 7.6 11.2M16.6 5.8H19.6V7.6C19.6 9.5 18.3 11 16.4 11.2"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path d="M12 15.2V18.4M8.4 20.6H15.6M9.6 18.4H14.4L15.6 20.6H8.4L9.6 18.4Z" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function UsersIcon({ size, color = '#7FB1FF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9.2" cy="8.4" r="3.4" stroke={color} strokeWidth={sw} />
      <Path
        d="M2.8 19.8C3.4 16.4 6 14.2 9.2 14.2C12.4 14.2 15 16.4 15.6 19.8"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M16 5.4C17.8 5.7 19.1 7.2 19.1 9C19.1 10.8 17.8 12.3 16 12.6M17.6 15C19.7 15.7 21.1 17.4 21.4 19.8"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MinusIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12H19" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

export function BookIcon({ size, color = '#FFFFFF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4.2" y="3.2" width="15.6" height="17.6" rx="2.8" stroke={color} strokeWidth={sw} />
      <Path d="M8.2 3.4V20.6" stroke={color} strokeWidth={sw} />
      <Path d="M12.4 8H16.2M12.4 11.6H16.2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function HistoryIcon({ size, color = '#FFFFFF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.4 12C4.4 7.8 7.8 4.4 12 4.4C16.2 4.4 19.6 7.8 19.6 12C19.6 16.2 16.2 19.6 12 19.6C9.4 19.6 7.1 18.3 5.8 16.3"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path
        d="M4.6 11.2L4.4 14.6L7.4 13.6"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 8.2V12L14.8 13.6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export function VerifiedIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1.8L14.6 3.9L18 3.6L19.1 6.8L22 8.7L20.9 12L22 15.3L19.1 17.2L18 20.4L14.6 20.1L12 22.2L9.4 20.1L6 20.4L4.9 17.2L2 15.3L3.1 12L2 8.7L4.9 6.8L6 3.6L9.4 3.9L12 1.8Z"
        fill="#3B9DFF"
      />
      <Path
        d="M8.4 12.2L11 14.8L15.6 9.6"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UtensilsIcon({ size, color = '#FFFFFF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 3.2V9.4C7.2 10.4 8 11.2 9 11.2C10 11.2 10.8 10.4 10.8 9.4V3.2"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Path d="M9 11.2V20.8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Path
        d="M15.4 3.2C13.9 4.6 13.2 6.6 13.2 8.6C13.2 10.1 14.2 11.2 15.6 11.2H16.2V20.8M16.2 3.2V11.2"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SparkleIcon({ size, color = '#B78BFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.4L13.9 8.6L20 10.5L13.9 12.4L12 18.6L10.1 12.4L4 10.5L10.1 8.6L12 2.4Z" />
      <Path d="M18.8 15.4L19.6 18L22.2 18.8L19.6 19.6L18.8 22.2L18 19.6L15.4 18.8L18 18L18.8 15.4Z" />
    </Svg>
  );
}

export function IngredientDotIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="rgba(183, 79, 245, 0.16)" />
      <Path
        d="M12 5.6C14.1 8.4 15.2 10.4 15.2 12.1C15.2 14.4 13.8 16.2 12 16.2C10.2 16.2 8.8 14.4 8.8 12.1C8.8 10.4 9.9 8.4 12 5.6Z"
        fill="#B78BFF"
      />
    </Svg>
  );
}

export function CalendarCheckIcon({ size, color = '#FFFFFF' }: IconProps) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.2" y="4.6" width="17.6" height="16" rx="3.2" stroke={color} strokeWidth={sw} />
      <Path d="M3.4 9.4H20.6" stroke={color} strokeWidth={sw} />
      <Path d="M7.6 2.6V6M16.4 2.6V6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Path
        d="M8.6 14.6L11.2 17.2L15.8 12.4"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BoltIcon({ size, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M13.4 2.2L4.8 13.4H11L9.8 21.8L19.2 9.8H12.6L13.4 2.2Z" />
    </Svg>
  );
}
