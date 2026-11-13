import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import { FlameIcon } from '@/components/dashboard/icons';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import {
  BookIcon,
  CheckCircleIcon,
  CheckIcon,
  FlameTileIcon,
  StarIcon,
  TrophyIcon,
} from '@/components/icons';
import { api, type StreakPayload } from '@/lib/api';

export default function StreakScreen() {
  const { scale } = useAppFrame();
  const [data, setData] = useState<StreakPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api
        .streak()
        .then((payload) => {
          if (active) setData(payload.streak);
        })
        .catch(() => {
          if (active) setData(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const streakStats = {
    currentStreak: data?.current ?? 0,
    longestStreak: data?.longest ?? 0,
    totalRecipesCooked: data?.totalRecipesCooked ?? 0,
  };
  const streakWeek = data?.week ?? [];
  const streakMilestones = data?.milestones ?? [];
  const daysToNextMilestone = data?.daysToNextMilestone ?? 0;
  const progress = streakStats.currentStreak / 30;

  if (loading && !data) {
    return (
      <View style={[styles.root, loaderStyle]}>
        <ActivityIndicator size="large" color={NutriColors.purple} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={title(scale)}>Your Streak</Text>
        <Text style={subtitle(scale)}>Consistency builds results!</Text>

        <View style={ringWrapStyle(scale)}>
          <ProgressRing
            size={236 * scale}
            strokeWidth={15 * scale}
            trackColor={NutriColors.track}
            lineCap="round"
            segments={[{ colors: ['#8F3BF3', '#C366FF'], startDeg: 40, sweepDeg: 280 }]}>
            <FlameIcon size={46 * scale} />
            <Text style={ringValue(scale)}>{streakStats.currentStreak}</Text>
            <Text style={ringLabel(scale)}>Day Streak</Text>
          </ProgressRing>
        </View>

        <View style={weekRow(scale)}>
          {streakWeek.map((entry) => (
            <View key={entry.day} style={weekItem}>
              <View style={weekCircle(entry, scale)}>
                {entry.done ? (
                  <CheckIcon size={18 * scale} color="#FFFFFF" />
                ) : entry.isToday ? (
                  <StarIcon size={18 * scale} color={NutriColors.purple} />
                ) : null}
              </View>
              <Text
                style={[
                  weekDay(scale),
                  entry.isToday && { color: NutriColors.purple, fontWeight: '700' },
                ]}>
                {entry.day}
              </Text>
            </View>
          ))}
        </View>

        <View style={[card(scale), keepUpCard(scale)]}>
          <StarIcon size={24 * scale} color={NutriColors.purple} />
          <View style={styles.keepUpText}>
            <Text style={keepUpTitle(scale)}>Keep it up!</Text>
            <Text style={keepUpBody(scale)}>
              You&apos;re {daysToNextMilestone} days away from your next milestone.
            </Text>
          </View>
        </View>

        <Text style={sectionTitle(scale)}>Milestones &amp; Rewards</Text>
        <View style={milestoneList(scale)}>
          {streakMilestones.map((milestone) => (
            <View key={milestone.name} style={[card(scale), milestoneCard(scale)]}>
              <View style={milestoneIcon(milestone.status, scale)}>
                {milestone.status === 'completed' ? (
                  <CheckIcon size={20 * scale} color="#FFFFFF" />
                ) : milestone.status === 'in-progress' ? (
                  <FlameTileIcon size={22 * scale} />
                ) : (
                  <TrophyIcon size={22 * scale} color={NutriColors.textFaint} />
                )}
              </View>
              <View style={styles.milestoneText}>
                <Text style={milestoneName(scale)}>{milestone.name}</Text>
                <Text style={milestoneReward(scale)}>{milestone.reward}</Text>
                {milestone.status === 'in-progress' ? (
                  <View style={progressTrack(scale)}>
                    <LinearGradient
                      colors={['#B74FF5', '#753AFF']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={progressFill(progress)}
                    />
                  </View>
                ) : null}
              </View>
              {milestone.status === 'completed' ? (
                <CheckCircleIcon size={26 * scale} circleColor={NutriColors.green} />
              ) : (
                <Text style={milestoneChip(milestone.status, scale)}>
                  {milestone.status === 'in-progress'
                    ? `${streakStats.currentStreak}/${milestone.days}`
                    : 'Locked'}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text style={sectionTitle(scale)}>Streak Stats</Text>
        <View style={[card(scale), statsCard(scale)]}>
          <StatRow
            icon={<FlameTileIcon size={24 * scale} />}
            label="Current streak"
            value={`${streakStats.currentStreak} days`}
            scale={scale}
          />
          <View style={statDivider(scale)} />
          <StatRow
            icon={<TrophyIcon size={24 * scale} color={NutriColors.amber} />}
            label="Longest streak"
            value={`${streakStats.longestStreak} days`}
            scale={scale}
          />
          <View style={statDivider(scale)} />
          <StatRow
            icon={<BookIcon size={24 * scale} color={NutriColors.blue} />}
            label="Total recipes cooked"
            value={`${streakStats.totalRecipesCooked}`}
            scale={scale}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  scale,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  scale: number;
}) {
  return (
    <View style={statRow(scale)}>
      {icon}
      <Text style={statLabel(scale)}>{label}</Text>
      <Text style={statValue(scale)}>{value}</Text>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  keepUpText: {
    flex: 1,
  } as ViewStyle,
  milestoneText: {
    flex: 1,
  } as ViewStyle,
};

const loaderStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
};

const title = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 34 * scale,
  fontWeight: '700',
  marginTop: 18 * scale,
  paddingHorizontal: 26 * scale,
});

const subtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 15 * scale,
  marginTop: 6 * scale,
  paddingHorizontal: 26 * scale,
});

const ringWrapStyle = (scale: number): ViewStyle => ({
  alignItems: 'center',
  marginTop: 30 * scale,
});

const ringValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 58 * scale,
  fontWeight: '700',
  lineHeight: 62 * scale,
  marginTop: 8 * scale,
});

const ringLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 16 * scale,
  fontWeight: '500',
});

const weekRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 30 * scale,
  paddingHorizontal: 30 * scale,
});

const weekItem: ViewStyle = {
  alignItems: 'center',
};

const weekCircle = (
  entry: { day: string; done: boolean; isToday: boolean },
  scale: number
): ViewStyle => ({
  width: 40 * scale,
  height: 40 * scale,
  borderRadius: 20 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: entry.done ? '#8B5CF6' : 'transparent',
  borderWidth: 1.6,
  borderColor: entry.done
    ? '#8B5CF6'
    : entry.isToday
      ? NutriColors.purple
      : NutriColors.track,
});

const weekDay = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 11.5 * scale,
  marginTop: 8 * scale,
});

const card = (scale: number): ViewStyle => ({
  backgroundColor: NutriColors.card,
  borderRadius: 20 * scale,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const keepUpCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  padding: 18 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 26 * scale,
});

const keepUpTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
});

const keepUpBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  marginTop: 4 * scale,
  lineHeight: 20 * scale,
});

const sectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
  marginTop: 30 * scale,
  paddingHorizontal: 26 * scale,
});

const milestoneList = (scale: number): ViewStyle => ({
  gap: 12 * scale,
  marginTop: 16 * scale,
  paddingHorizontal: 26 * scale,
});

const milestoneCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  padding: 16 * scale,
});

const milestoneIcon = (status: string, scale: number): ViewStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor:
    status === 'completed'
      ? 'rgba(0, 213, 138, 0.14)'
      : status === 'in-progress'
        ? 'rgba(183, 79, 245, 0.16)'
        : NutriColors.track,
});

const milestoneName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const milestoneReward = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  marginTop: 3,
});

const milestoneChip = (status: string, scale: number): TextStyle => ({
  color: status === 'in-progress' ? NutriColors.purple : NutriColors.textFaint,
  fontSize: 13 * scale,
  fontWeight: '700',
});

const progressTrack = (scale: number): ViewStyle => ({
  height: 6 * scale,
  borderRadius: 3 * scale,
  backgroundColor: NutriColors.track,
  marginTop: 10 * scale,
  overflow: 'hidden',
});

const progressFill = (progress: number): ViewStyle => ({
  width: `${Math.min(100, Math.round(progress * 100))}%`,
  height: '100%',
  borderRadius: 3,
});

const statsCard = (scale: number): ViewStyle => ({
  marginHorizontal: 26 * scale,
  marginTop: 16 * scale,
  paddingHorizontal: 18 * scale,
  paddingVertical: 6 * scale,
  marginBottom: 150 * scale,
});

const statRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  paddingVertical: 16 * scale,
});

const statLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 15 * scale,
  flex: 1,
});

const statValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const statDivider = (scale: number): ViewStyle => ({
  height: 1,
  backgroundColor: NutriColors.divider,
});
