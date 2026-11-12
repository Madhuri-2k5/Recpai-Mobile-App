import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRightIcon } from '@/components/dashboard/icons';

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
import {
  BookIcon,
  CarbsIcon,
  CheckIcon,
  CrownIcon,
  FatIcon,
  FlameTileIcon,
  GearIcon,
  HistoryIcon,
  ProteinIcon,
  TrophyIcon,
  VerifiedIcon,
} from '@/components/icons';
import { user } from '@/data/dashboardMockData';
import { streakStats } from '@/data/streakMockData';

const GOALS = [
  { label: 'Daily Calories', value: '2,000 kcal', Icon: FlameTileIcon },
  { label: 'Protein', value: '100 g', Icon: ProteinIcon },
  { label: 'Carbs', value: '250 g', Icon: CarbsIcon },
  { label: 'Fats', value: '67 g', Icon: FatIcon },
];

const MENU_ROWS = [
  { label: 'Saved Recipes', value: '24', icon: <BookIcon size={21} color={NutriColors.blue} /> },
  { label: 'Nutrition History', value: '', icon: <HistoryIcon size={21} color={NutriColors.teal} /> },
  { label: 'Achievements', value: '', icon: <TrophyIcon size={21} color={NutriColors.amber} /> },
];

type Plan = 'monthly' | 'yearly';

export default function ProfileScreen() {
  const { scale } = useAppFrame();
  const [plan, setPlan] = useState<Plan>('yearly');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={topRow(scale)}>
          <View style={gearButton(scale)}>
            <GearIcon size={22 * scale} color={NutriColors.textDim} />
          </View>
        </View>

        <View style={profileHead}>
          <View>
            <Image source={user.avatar} style={avatar(scale)} contentFit="cover" />
            <View style={verifiedWrap(scale)}>
              <VerifiedIcon size={22 * scale} />
            </View>
          </View>
          <Text style={name(scale)}>Sarah Johnson</Text>
          <Text style={handle(scale)}>@sarahj</Text>
        </View>

        <View style={statsRow(scale)}>
          <StatCell value={`${streakStats.currentStreak}`} label="Day Streak" scale={scale} />
          <StatDivider scale={scale} />
          <StatCell value="42" label="Recipes" scale={scale} />
          <StatDivider scale={scale} />
          <StatCell value="8.4k" label="Points" scale={scale} />
        </View>

        <View style={sectionHead(scale)}>
          <Text style={sectionTitle(scale)}>Nutrition Goals</Text>
          <Pressable style={editChip(scale)}>
            <Text style={editChipText(scale)}>Edit</Text>
          </Pressable>
        </View>
        <View style={goalsGrid(scale)}>
          {GOALS.map((goal) => (
            <View key={goal.label} style={goalCard(scale)}>
              <goal.Icon size={22 * scale} />
              <Text style={goalValue(scale)}>{goal.value}</Text>
              <Text style={goalLabel(scale)}>{goal.label}</Text>
            </View>
          ))}
        </View>

        <View style={sectionHead(scale)}>
          <Text style={sectionTitle(scale)}>Subscription</Text>
          <View style={freeChip(scale)}>
            <Text style={freeChipText(scale)}>Free plan</Text>
          </View>
        </View>
        <View style={premiumCard(scale)}>
          <LinearGradient
            colors={['#1A1033', '#241543']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={premiumGradient(scale)}>
            <View style={crownWrap(scale)}>
              <CrownIcon size={26 * scale} />
            </View>
            <Text style={premiumTitle(scale)}>NutriAI Premium</Text>
            <Text style={premiumBody(scale)}>
              Unlimited AI scans, personal meal plans and exclusive chef recipes.
            </Text>

            <View style={planRow(scale)}>
              <PlanCard
                active={plan === 'monthly'}
                onPress={() => setPlan('monthly')}
                name="Monthly"
                price="$9.99"
                caption="per month"
                scale={scale}
              />
              <PlanCard
                active={plan === 'yearly'}
                onPress={() => setPlan('yearly')}
                name="Yearly"
                price="$79.99"
                caption="save 33%"
                badge="Best value"
                scale={scale}
              />
            </View>

            <LinearGradient
              colors={['#B74FF5', '#753AFF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={upgradeButton(scale)}>
              <Text style={upgradeText(scale)}>Upgrade to Premium</Text>
            </LinearGradient>
            <Text style={restoreText(scale)}>Restore purchase</Text>
          </LinearGradient>
        </View>

        <View style={menuCard(scale)}>
          {MENU_ROWS.map((row, index) => (
            <Pressable key={row.label} style={menuRow(scale, index === MENU_ROWS.length - 1)}>
              <View style={menuIconWrap(scale)}>{row.icon}</View>
              <Text style={menuLabel(scale)}>{row.label}</Text>
              {row.value ? <Text style={menuValue(scale)}>{row.value}</Text> : null}
              <ChevronRightIcon size={18 * scale} color={NutriColors.textFaint} />
            </Pressable>
          ))}
        </View>

        <Pressable style={settingsRow(scale)}>
          <View style={menuIconWrap(scale)}>
            <GearIcon size={21 * scale} color={NutriColors.textDim} />
          </View>
          <Text style={menuLabel(scale)}>Settings</Text>
          <ChevronRightIcon size={18 * scale} color={NutriColors.textFaint} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatCell({ value, label, scale }: { value: string; label: string; scale: number }) {
  return (
    <View style={statCell}>
      <Text style={statValue(scale)}>{value}</Text>
      <Text style={statLabel(scale)}>{label}</Text>
    </View>
  );
}

function PlanCard({
  active,
  onPress,
  name,
  price,
  caption,
  badge,
  scale,
}: {
  active: boolean;
  onPress: () => void;
  name: string;
  price: string;
  caption: string;
  badge?: string;
  scale: number;
}) {
  return (
    <Pressable onPress={onPress} style={planCard(active, scale)}>
      {badge ? (
        <View style={planBadge(scale)}>
          <Text style={planBadgeText(scale)}>{badge}</Text>
        </View>
      ) : null}
      <Text style={planName(scale)}>{name}</Text>
      <Text style={planPrice(scale)}>{price}</Text>
      <Text style={planCaption(scale)}>{caption}</Text>
      <View style={planCheck(active, scale)}>
        {active ? <CheckIcon size={12 * scale} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
};

const topRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'flex-start',
  paddingHorizontal: 26 * scale,
  marginTop: 18 * scale,
});

const gearButton = (scale: number): ViewStyle => ({
  width: 46 * scale,
  height: 46 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const profileHead: ViewStyle = {
  alignItems: 'center',
  marginTop: 14,
};

const avatar = (scale: number): ImageStyle => ({
  width: 96 * scale,
  height: 96 * scale,
  borderRadius: 48 * scale,
});

const verifiedWrap = (scale: number): ViewStyle => ({
  position: 'absolute',
  right: -2,
  bottom: -2,
});

const name = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 26 * scale,
  fontWeight: '700',
  marginTop: 14 * scale,
});

const handle = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 14 * scale,
  marginTop: 4 * scale,
});

const statsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 26 * scale,
  marginTop: 22 * scale,
  paddingVertical: 18 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const statCell: ViewStyle = {
  flex: 1,
  alignItems: 'center',
};

const statValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 22 * scale,
  fontWeight: '700',
});

const statLabel = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginTop: 4 * scale,
});

const StatDivider = ({ scale }: { scale: number }) => (
  <View style={{ width: 1, height: 34 * scale, backgroundColor: NutriColors.divider }} />
);

const sectionHead = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 28 * scale,
  paddingHorizontal: 26 * scale,
  marginBottom: 14 * scale,
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
});

const editChip = (scale: number): ViewStyle => ({
  paddingHorizontal: 14 * scale,
  paddingVertical: 7 * scale,
  borderRadius: 11 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.45)',
});

const editChipText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
});

const goalsGrid = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12 * scale,
  paddingHorizontal: 26 * scale,
});

const goalCard = (scale: number): ViewStyle => ({
  width: '47%',
  alignItems: 'center',
  paddingVertical: 18 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const goalValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
  marginTop: 10 * scale,
});

const goalLabel = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginTop: 3,
});

const freeChip = (scale: number): ViewStyle => ({
  paddingHorizontal: 12 * scale,
  paddingVertical: 6 * scale,
  borderRadius: 10 * scale,
  backgroundColor: NutriColors.track,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const freeChipText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  fontWeight: '700',
});

const premiumCard = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  borderRadius: 22 * scale,
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
  overflow: 'hidden',
});

const premiumGradient = (scale: number): ViewStyle => ({
  alignItems: 'center',
  padding: 20 * scale,
});

const crownWrap = (scale: number): ViewStyle => ({
  width: 54 * scale,
  height: 54 * scale,
  borderRadius: 18 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 215, 107, 0.14)',
});

const premiumTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
  marginTop: 12 * scale,
});

const premiumBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  lineHeight: 20 * scale,
  textAlign: 'center',
  marginTop: 6 * scale,
});

const planRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 12 * scale,
  alignSelf: 'stretch',
  marginTop: 18 * scale,
});

const planCard = (active: boolean, scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 16 * scale,
  borderRadius: 16 * scale,
  backgroundColor: active ? 'rgba(183, 79, 245, 0.14)' : 'rgba(2, 8, 23, 0.45)',
  borderWidth: 1.5,
  borderColor: active ? NutriColors.purple : NutriColors.borderMuted,
});

const planBadge = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: -10 * scale,
  paddingHorizontal: 9 * scale,
  paddingVertical: 3 * scale,
  borderRadius: 7 * scale,
  backgroundColor: NutriColors.amber,
});

const planBadgeText = (scale: number): TextStyle => ({
  color: '#241505',
  fontSize: 10 * scale,
  fontWeight: '800',
});

const planName = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
});

const planPrice = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '800',
  marginTop: 7 * scale,
});

const planCaption = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 11.5 * scale,
  marginTop: 3,
});

const planCheck = (active: boolean, scale: number): ViewStyle => ({
  width: 18 * scale,
  height: 18 * scale,
  borderRadius: 9 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10 * scale,
  borderWidth: 1.5,
  borderColor: active ? NutriColors.purple : NutriColors.borderMuted,
  backgroundColor: active ? NutriColors.purple : 'transparent',
});

const upgradeButton = (scale: number): ViewStyle => ({
  alignSelf: 'stretch',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56 * scale,
  borderRadius: 17 * scale,
  marginTop: 18 * scale,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.22)',
});

const upgradeText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16.5 * scale,
  fontWeight: '700',
});

const restoreText = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 13 * scale,
  marginTop: 12 * scale,
});

const menuCard = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  marginTop: 28 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 16 * scale,
});

const menuRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13 * scale,
  paddingVertical: 16 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const menuIconWrap = (scale: number): ViewStyle => ({
  width: 40 * scale,
  height: 40 * scale,
  borderRadius: 13 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: NutriColors.input,
});

const menuLabel = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 15.5 * scale,
  fontWeight: '600',
  flex: 1,
});

const menuValue = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '600',
  marginRight: 4 * scale,
});

const settingsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 14 * scale,
  marginBottom: 150 * scale,
  paddingVertical: 16 * scale,
  paddingHorizontal: 16 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});
