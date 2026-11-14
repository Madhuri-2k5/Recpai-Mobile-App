import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
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
import { useFocusEffect, useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import {
  BookIcon,
  CarbsIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  CrownIcon,
  FatIcon,
  FlameTileIcon,
  GearIcon,
  ProteinIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
  VerifiedIcon,
} from '@/components/icons';
import { api, type Goals, type Recipe, type Subscription, type UserStats } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const MENU_ROWS = [
  { label: 'Saved Recipes', key: 'recipes', icon: <BookIcon size={21} color={NutriColors.blue} /> },
  { label: 'Groups', key: 'groups', icon: <UsersIcon size={21} color={NutriColors.teal} /> },
  { label: 'Achievements', key: 'points', icon: <TrophyIcon size={21} color={NutriColors.amber} /> },
];

type Plan = 'monthly' | 'yearly';

export default function ProfileScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan>('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [subMessage, setSubMessage] = useState('');
  const [goalsVisible, setGoalsVisible] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ calories: '', protein: '', carbs: '', fat: '' });
  const [savingGoals, setSavingGoals] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [recipesModalVisible, setRecipesModalVisible] = useState(false);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);

  const load = useCallback(async () => {
    try {
      const [payload, recipesPayload] = await Promise.all([api.stats(), api.myRecipes()]);
      setStats(payload.stats);
      setGoals(payload.goals);
      setSubscription(payload.subscription);
      setMyRecipes(recipesPayload.recipes);
    } catch {
      // keep previous
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openGoalsEditor() {
    if (!goals) return;
    setGoalDraft({
      calories: String(goals.calories),
      protein: String(goals.protein),
      carbs: String(goals.carbs),
      fat: String(goals.fat),
    });
    setGoalsVisible(true);
  }

  async function saveGoals() {
    if (savingGoals) return;
    setSavingGoals(true);
    try {
      const payload = await api.updateGoals({
        calories: Number(goalDraft.calories) || undefined,
        protein: Number(goalDraft.protein) || undefined,
        carbs: Number(goalDraft.carbs) || undefined,
        fat: Number(goalDraft.fat) || undefined,
      });
      setGoals(payload.goals);
      setGoalsVisible(false);
    } finally {
      setSavingGoals(false);
    }
  }

  async function purchase() {
    if (purchasing) return;
    setPurchasing(true);
    setSubMessage('');
    try {
      const payload = await api.purchase(plan);
      setSubscription(payload.subscription);
      setSubMessage(`Successfully upgraded to NutriAI Premium (${plan} plan)!`);
    } finally {
      setPurchasing(false);
    }
  }

  async function cancelSubscription() {
    if (canceling) return;
    setCanceling(true);
    setSubMessage('');
    try {
      const payload = await api.cancelSubscription();
      setSubscription(payload.subscription);
      setSubMessage('Your subscription has been canceled. You have returned to the Free plan.');
    } catch {
      setSubMessage('Cancellation failed. Please try again.');
    } finally {
      setCanceling(false);
    }
  }

  function handleMenuPress(key: string) {
    if (key === 'recipes') {
      setRecipesModalVisible(true);
    } else if (key === 'groups') {
      router.push({ pathname: '/community', params: { tab: 'groups' } });
    } else if (key === 'points') {
      router.push('/streak');
    }
  }

  const isPremium = subscription?.plan === 'monthly' || subscription?.plan === 'yearly';
  const firstName = (user?.name ?? 'there').split(' ')[0];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 * scale }}>
        <View style={topRow(scale)}>
          <Pressable onPress={() => setSettingsVisible(true)} style={gearButton(scale)}>
            <GearIcon size={22 * scale} color={NutriColors.textDim} />
          </Pressable>
          <Pressable onPress={signOut} style={logoutButton(scale)}>
            <Text style={logoutText(scale)}>Log out</Text>
          </Pressable>
        </View>

        <View style={profileHead}>
          <View>
            <View style={avatar(scale)}>
              <Text style={avatarText(scale)}>{(firstName[0] || 'U').toUpperCase()}</Text>
            </View>
            <View style={verifiedWrap(scale)}>
              <VerifiedIcon size={22 * scale} />
            </View>
          </View>
          <Text style={name(scale)}>{user?.name ?? '—'}</Text>
          <Text style={handle(scale)}>{user?.email ?? ''}</Text>
        </View>

        <View style={statsRow(scale)}>
          <StatCell value={`${stats?.streak ?? 0}`} label="Day Streak" scale={scale} />
          <StatDivider scale={scale} />
          <StatCell value={`${stats?.recipes ?? 0}`} label="Recipes" scale={scale} />
          <StatDivider scale={scale} />
          <StatCell value={formatPoints(stats?.points ?? 0)} label="Points" scale={scale} />
        </View>

        <View style={sectionHead(scale)}>
          <Text style={sectionTitle(scale)}>Nutrition Goals</Text>
          <Pressable style={editChip(scale)} onPress={openGoalsEditor}>
            <Text style={editChipText(scale)}>Edit</Text>
          </Pressable>
        </View>
        {goals ? (
          <View style={goalsGrid(scale)}>
            <GoalCard Icon={FlameTileIcon} value={`${goals.calories.toLocaleString('en-US')} kcal`} label="Daily Calories" scale={scale} />
            <GoalCard Icon={ProteinIcon} value={`${goals.protein} g`} label="Protein" scale={scale} />
            <GoalCard Icon={CarbsIcon} value={`${goals.carbs} g`} label="Carbs" scale={scale} />
            <GoalCard Icon={FatIcon} value={`${goals.fat} g`} label="Fats" scale={scale} />
          </View>
        ) : null}

        <View style={sectionHead(scale)}>
          <Text style={sectionTitle(scale)}>Subscription</Text>
          <View style={isPremium ? premiumChip(scale) : freeChip(scale)}>
            <Text style={isPremium ? premiumChipText(scale) : freeChipText(scale)}>
              {isPremium ? 'Premium' : 'Free plan'}
            </Text>
          </View>
        </View>

        {subMessage ? (
          <View style={subBanner(scale)}>
            <CheckCircleIcon size={18 * scale} circleColor={NutriColors.green} />
            <Text style={subBannerText(scale)}>{subMessage}</Text>
          </View>
        ) : null}

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

            {isPremium ? (
              <>
                <Text style={premiumActiveText(scale)}>
                  Thanks for supporting NutriAI! Your {subscription?.plan} plan renews on{' '}
                  {subscription?.renewsAt ? new Date(subscription.renewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}.
                </Text>
                <Pressable
                  onPress={cancelSubscription}
                  disabled={canceling}
                  style={cancelButton(scale)}>
                  <Text style={cancelButtonText(scale)}>
                    {canceling ? 'Canceling…' : 'Cancel Subscription'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
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
                  <Pressable onPress={purchase} style={upgradePress}>
                    <Text style={upgradeText(scale)}>
                      {purchasing ? 'Processing…' : 'Upgrade to Premium'}
                    </Text>
                  </Pressable>
                </LinearGradient>
                <Text style={restoreText(scale)}>Mock payment — no card required</Text>
              </>
            )}
          </LinearGradient>
        </View>

        <View style={menuCard(scale)}>
          {MENU_ROWS.map((row, index) => (
            <Pressable
              key={row.key}
              onPress={() => handleMenuPress(row.key)}
              style={menuRow(scale, index === MENU_ROWS.length - 1)}>
              <View style={menuIconWrap(scale)}>{row.icon}</View>
              <Text style={menuLabel(scale)}>{row.label}</Text>
              <Text style={menuValue(scale)}>{menuValueFor(row.key, stats)}</Text>
              <ChevronRightIcon size={18 * scale} color={NutriColors.textFaint} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setSettingsVisible(true)} style={settingsRow(scale)}>
          <View style={menuIconWrap(scale)}>
            <GearIcon size={21 * scale} color={NutriColors.textDim} />
          </View>
          <Text style={menuLabel(scale)}>Settings</Text>
          <ChevronRightIcon size={18 * scale} color={NutriColors.textFaint} />
        </Pressable>
      </ScrollView>

      {/* Goals Editor Modal */}
      <Modal
        visible={goalsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalsVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setGoalsVisible(false)} />
          <View style={sheet(scale)}>
            <Text style={sheetTitle(scale)}>Nutrition Goals</Text>
            {(
              [
                ['calories', 'Daily calories (kcal)'],
                ['protein', 'Protein (g)'],
                ['carbs', 'Carbs (g)'],
                ['fat', 'Fats (g)'],
              ] as const
            ).map(([key, label]) => (
              <View key={key}>
                <Text style={sheetLabel(scale)}>{label}</Text>
                <TextInput
                  style={sheetInput(scale)}
                  keyboardType="number-pad"
                  value={goalDraft[key]}
                  onChangeText={(value) => setGoalDraft((draft) => ({ ...draft, [key]: value }))}
                />
              </View>
            ))}
            <Pressable onPress={saveGoals} disabled={savingGoals} style={sheetButton(scale)}>
              <Text style={sheetButtonText(scale)}>{savingGoals ? 'Saving…' : 'Save Goals'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setSettingsVisible(false)} />
          <View style={sheet(scale)}>
            <View style={settingsHeader(scale)}>
              <Text style={sheetTitle(scale)}>App Settings</Text>
              <Pressable onPress={() => setSettingsVisible(false)}>
                <CloseIcon size={20 * scale} />
              </Pressable>
            </View>

            <View style={settingsItem(scale)}>
              <Text style={settingsItemLabel(scale)}>Application</Text>
              <Text style={settingsItemValue(scale)}>RecPai 2.0 (NutriAI)</Text>
            </View>
            <View style={settingsItem(scale)}>
              <Text style={settingsItemLabel(scale)}>Account</Text>
              <Text style={settingsItemValue(scale)}>{user?.name} ({user?.email})</Text>
            </View>
            <View style={settingsItem(scale)}>
              <Text style={settingsItemLabel(scale)}>Backend Mode</Text>
              <Text style={settingsItemValue(scale)}>Dual Mode (MongoDB + Embedded)</Text>
            </View>
            <View style={settingsItem(scale)}>
              <Text style={settingsItemLabel(scale)}>AI Engine</Text>
              <Text style={settingsItemValue(scale)}>Gemini 2.5 Flash + Resilient Fallback</Text>
            </View>

            <Pressable
              onPress={() => {
                setSettingsVisible(false);
                signOut();
              }}
              style={settingsLogoutBtn(scale)}>
              <Text style={settingsLogoutText(scale)}>Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Saved Recipes History Modal */}
      <Modal
        visible={recipesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRecipesModalVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setRecipesModalVisible(false)} />
          <View style={[sheet(scale), { maxHeight: '82%' }]}>
            <View style={settingsHeader(scale)}>
              <View>
                <Text style={sheetTitle(scale)}>Recipe History</Text>
                <Text style={sheetSubtitle(scale)}>
                  {myRecipes.length} {myRecipes.length === 1 ? 'saved recipe' : 'saved recipes'}
                </Text>
              </View>
              <Pressable onPress={() => setRecipesModalVisible(false)} style={modalCloseBtn(scale)}>
                <CloseIcon size={20 * scale} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 * scale, marginTop: 12 * scale }}>
              {myRecipes.map((r) => (
                <Pressable
                  key={r._id || r.id}
                  onPress={() => {
                    setRecipesModalVisible(false);
                    router.push({
                      pathname: '/recipe/[id]',
                      params: { id: r._id || r.id || '' },
                    });
                  }}
                  style={recipeHistoryItem(scale)}>
                  {r.imageUrl ? (
                    <Image source={{ uri: r.imageUrl }} style={recipeHistoryThumb(scale)} contentFit="cover" />
                  ) : (
                    <View style={[recipeHistoryThumb(scale), recipeHistoryPlaceholder(scale)]}>
                      <SparkleIcon size={20 * scale} color={NutriColors.purple} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 * scale }}>
                    <Text style={recipeHistoryTitle(scale)} numberOfLines={1}>
                      {r.title}
                    </Text>
                    <Text style={recipeHistoryMeta(scale)}>
                      {r.cuisine} • {r.prepTimeMinutes} min • {r.servings} {r.servings === 1 ? 'portion' : 'portions'}
                    </Text>
                  </View>
                  <Text style={recipeHistoryKcal(scale)}>{r.nutrition?.calories || 0} kcal</Text>
                </Pressable>
              ))}

              {myRecipes.length === 0 ? (
                <View style={emptyRecipesWrap(scale)}>
                  <SparkleIcon size={36 * scale} color={NutriColors.purple} />
                  <Text style={emptyRecipesTitle(scale)}>No saved recipes yet</Text>
                  <Text style={emptyRecipesBody(scale)}>
                    Scan food or ingredients to generate custom recipes with nutrition facts and scalable servings.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setRecipesModalVisible(false);
                      router.push('/scan');
                    }}
                    style={emptyRecipesBtn(scale)}>
                    <LinearGradient
                      colors={['#B74FF5', '#753AFF']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={emptyRecipesGradient(scale)}>
                      <Text style={emptyRecipesBtnText(scale)}>Scan Food Now</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function menuValueFor(key: string, stats: UserStats | null): string {
  if (!stats) return '';
  if (key === 'recipes') return String(stats.recipes);
  if (key === 'groups') return String(stats.groups);
  if (key === 'points') return formatPoints(stats.points);
  return '';
}

function formatPoints(points: number): string {
  return points >= 1000 ? `${(points / 1000).toFixed(1)}k` : String(points);
}

function GoalCard({
  Icon,
  value,
  label,
  scale,
}: {
  Icon: (props: { size: number }) => React.ReactElement;
  value: string;
  label: string;
  scale: number;
}) {
  return (
    <View style={goalCard(scale)}>
      <Icon size={22 * scale} />
      <Text style={goalValue(scale)}>{value}</Text>
      <Text style={goalLabel(scale)}>{label}</Text>
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

function StatDivider({ scale }: { scale: number }) {
  return <View style={statDivider(scale)} />;
}

const modalBackdrop: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(1, 5, 15, 0.72)',
  justifyContent: 'flex-end',
};

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  modalDismiss: {
    flex: 1,
  } as ViewStyle,
};

const topRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 26 * scale,
  marginTop: 18 * scale,
});

const gearButton = (scale: number): ViewStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 15 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  alignItems: 'center',
  justifyContent: 'center',
});

const logoutButton = (scale: number): ViewStyle => ({
  paddingHorizontal: 16 * scale,
  paddingVertical: 10 * scale,
  borderRadius: 14 * scale,
  backgroundColor: 'rgba(255, 92, 122, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(255, 92, 122, 0.35)',
});

const logoutText = (scale: number): TextStyle => ({
  color: '#FF7A93',
  fontSize: 13.5 * scale,
  fontWeight: '700',
});

const profileHead: ViewStyle = {
  alignItems: 'center',
  marginTop: 18,
};

const avatar = (scale: number): ViewStyle => ({
  width: 106 * scale,
  height: 106 * scale,
  borderRadius: 53 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  borderWidth: 3 * scale,
  borderColor: NutriColors.purple,
  alignItems: 'center',
  justifyContent: 'center',
});

const avatarText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 42 * scale,
  fontWeight: '800',
});

const verifiedWrap = (scale: number): ViewStyle => ({
  position: 'absolute',
  bottom: 2 * scale,
  right: 2 * scale,
});

const name = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 24 * scale,
  fontWeight: '800',
  marginTop: 14 * scale,
  letterSpacing: -0.3,
});

const handle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  marginTop: 3 * scale,
});

const statsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginHorizontal: 26 * scale,
  marginTop: 26 * scale,
  paddingVertical: 18 * scale,
  paddingHorizontal: 20 * scale,
  borderRadius: 22 * scale,
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
  fontSize: 20 * scale,
  fontWeight: '800',
});

const statLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  marginTop: 3 * scale,
});

const statDivider = (scale: number): ViewStyle => ({
  width: 1,
  height: 28 * scale,
  backgroundColor: NutriColors.divider,
});

const sectionHead = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 30 * scale,
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

const premiumChip = (scale: number): ViewStyle => ({
  paddingHorizontal: 12 * scale,
  paddingVertical: 6 * scale,
  borderRadius: 10 * scale,
  backgroundColor: 'rgba(255, 215, 107, 0.14)',
  borderWidth: 1,
  borderColor: 'rgba(255, 215, 107, 0.5)',
});

const premiumChipText = (scale: number): TextStyle => ({
  color: '#FFD76B',
  fontSize: 12.5 * scale,
  fontWeight: '700',
});

const subBanner = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginHorizontal: 26 * scale,
  marginBottom: 12 * scale,
  padding: 12 * scale,
  borderRadius: 14 * scale,
  backgroundColor: 'rgba(0, 213, 138, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(0, 213, 138, 0.4)',
});

const subBannerText = (scale: number): TextStyle => ({
  color: NutriColors.green,
  fontSize: 13 * scale,
  fontWeight: '600',
  flex: 1,
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

const premiumActiveText = (scale: number): TextStyle => ({
  color: '#FFD76B',
  fontSize: 13.5 * scale,
  lineHeight: 20 * scale,
  textAlign: 'center',
  marginTop: 16 * scale,
});

const cancelButton = (scale: number): ViewStyle => ({
  marginTop: 16 * scale,
  paddingHorizontal: 20 * scale,
  paddingVertical: 11 * scale,
  borderRadius: 13 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
});

const cancelButtonText = (scale: number): TextStyle => ({
  color: '#E2E8F0',
  fontSize: 13.5 * scale,
  fontWeight: '600',
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
  height: 56 * scale,
  borderRadius: 17 * scale,
  marginTop: 18 * scale,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.22)',
});

const upgradePress: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
};

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
  overflow: 'hidden',
});

const menuRow = (scale: number, last: boolean): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  paddingHorizontal: 18 * scale,
  paddingVertical: 16 * scale,
  borderBottomWidth: last ? 0 : 1,
  borderBottomColor: NutriColors.divider,
});

const menuIconWrap = (scale: number): ViewStyle => ({
  width: 38 * scale,
  height: 38 * scale,
  borderRadius: 12 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  alignItems: 'center',
  justifyContent: 'center',
});

const menuLabel = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
  fontWeight: '600',
  flex: 1,
});

const menuValue = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
  fontWeight: '700',
  marginRight: 6 * scale,
});

const settingsRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14 * scale,
  marginHorizontal: 26 * scale,
  marginTop: 14 * scale,
  paddingHorizontal: 18 * scale,
  paddingVertical: 16 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const sheet = (scale: number): ViewStyle => ({
  backgroundColor: NutriColors.card,
  borderTopWidth: 1.3,
  borderLeftWidth: 1.3,
  borderRightWidth: 1.3,
  borderColor: 'rgba(183, 79, 245, 0.45)',
  borderTopLeftRadius: 26 * scale,
  borderTopRightRadius: 26 * scale,
  paddingHorizontal: 22 * scale,
  paddingTop: 22 * scale,
  paddingBottom: 36 * scale,
});

const sheetTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 20 * scale,
  fontWeight: '700',
});

const sheetLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  fontWeight: '600',
  marginTop: 14 * scale,
  marginBottom: 8 * scale,
});

const sheetInput = (scale: number): TextStyle => ({
  backgroundColor: NutriColors.input,
  borderRadius: 14 * scale,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 16 * scale,
  paddingVertical: 13 * scale,
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
});

const sheetButton = (scale: number): ViewStyle => ({
  marginTop: 22 * scale,
  height: 54 * scale,
  borderRadius: 16 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: NutriColors.purple,
});

const sheetButtonText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const settingsHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16 * scale,
});

const settingsItem = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 12 * scale,
  borderBottomWidth: 1,
  borderBottomColor: NutriColors.divider,
});

const settingsItemLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
});

const settingsItemValue = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 14 * scale,
  fontWeight: '600',
  maxWidth: 200 * scale,
  textAlign: 'right',
});

const settingsLogoutBtn = (scale: number): ViewStyle => ({
  marginTop: 22 * scale,
  height: 50 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 92, 122, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(255, 92, 122, 0.4)',
});

const settingsLogoutText = (scale: number): TextStyle => ({
  color: '#FF7A93',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const sheetSubtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  marginTop: 2 * scale,
});

const modalCloseBtn = (scale: number): ViewStyle => ({
  width: 36 * scale,
  height: 36 * scale,
  borderRadius: 18 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  alignItems: 'center',
  justifyContent: 'center',
});

const recipeHistoryItem = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12 * scale,
  paddingHorizontal: 12 * scale,
  borderRadius: 16 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  marginBottom: 10 * scale,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.06)',
});

const recipeHistoryThumb = (scale: number): ImageStyle => ({
  width: 50 * scale,
  height: 50 * scale,
  borderRadius: 12 * scale,
});

const recipeHistoryPlaceholder = (scale: number): ViewStyle => ({
  backgroundColor: 'rgba(183, 79, 245, 0.15)',
  alignItems: 'center',
  justifyContent: 'center',
});

const recipeHistoryTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const recipeHistoryMeta = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  marginTop: 4 * scale,
});

const recipeHistoryKcal = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 14 * scale,
  fontWeight: '700',
  marginLeft: 8 * scale,
});

const emptyRecipesWrap = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 32 * scale,
  paddingHorizontal: 20 * scale,
});

const emptyRecipesTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
  marginTop: 12 * scale,
});

const emptyRecipesBody = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  textAlign: 'center',
  marginTop: 6 * scale,
  lineHeight: 19 * scale,
});

const emptyRecipesBtn = (scale: number): ViewStyle => ({
  marginTop: 18 * scale,
  borderRadius: 15 * scale,
  overflow: 'hidden',
  width: '100%',
});

const emptyRecipesGradient = (scale: number): ViewStyle => ({
  height: 48 * scale,
  alignItems: 'center',
  justifyContent: 'center',
});

const emptyRecipesBtnText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});
