import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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
  BookmarkIcon,
  CheckCircleIcon,
  CommentIcon,
  HeartIcon,
  PlusIcon,
  ShareIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
} from '@/components/icons';
import {
  challenges,
  communityPosts,
  groups,
  recipeHistory,
  type CommunityPost,
} from '@/data/communityMockData';
import { getRecipeById } from '@/data/recipesMockData';

type CommunityTab = 'feed' | 'challenges' | 'groups';

export default function CommunityScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const [tab, setTab] = useState<CommunityTab>('feed');
  const [liked, setLiked] = useState<Record<string, boolean>>({ 'post-1': true });
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  function toggleLike(id: string) {
    setLiked((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleBookmark(id: string) {
    setBookmarked((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={title(scale)}>Community</Text>
        <Text style={subtitle(scale)}>Real people. Real food. Real progress.</Text>

        <View style={segmentWrap(scale)}>
          {(['feed', 'challenges', 'groups'] as CommunityTab[]).map((item) => {
            const active = tab === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={segmentButton(active, scale)}>
                {active ? (
                  <LinearGradient
                    colors={['#B74FF5', '#753AFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={segmentGradient(scale)}
                  />
                ) : null}
                <Text style={[segmentText(scale), active && styles.segmentTextActive]}>
                  {item === 'feed' ? 'Feed' : item === 'challenges' ? 'Challenges' : 'Groups'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'feed' ? (
          <View style={listWrap(scale)}>
            <View style={challengeBanner(scale)}>
              <LinearGradient
                colors={['#8F3BF3', '#B74FF5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={bannerGradient(scale)}>
                <CheckCircleIcon size={26 * scale} circleColor="#FFFFFF" checkColor="#7C3AED" />
                <View style={styles.bannerText}>
                  <Text style={bannerTitle(scale)}>7-Day Healthy Cooking Challenge</Text>
                  <Text style={bannerBody(scale)}>Completed — 200 points earned!</Text>
                </View>
                <TrophyIcon size={26 * scale} color="#FFD76B" />
              </LinearGradient>
            </View>

            {communityPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={!!liked[post.id]}
                bookmarked={!!bookmarked[post.id]}
                onLike={() => toggleLike(post.id)}
                onBookmark={() => toggleBookmark(post.id)}
                scale={scale}
              />
            ))}
          </View>
        ) : null}

        {tab === 'challenges' ? (
          <View style={listWrap(scale)}>
            {challenges.map((challenge) => (
              <View key={challenge.id} style={challengeCard(scale)}>
                <View style={challengeTopRow(scale)}>
                  <View style={challengeIconWrap(scale)}>
                    <TrophyIcon size={24 * scale} color={NutriColors.amber} />
                  </View>
                  <View style={styles.challengeHeadText}>
                    <Text style={challengeName(scale)}>{challenge.name}</Text>
                    <Text style={challengeParticipants(scale)}>
                      {challenge.participants.toLocaleString('en-US')} participants
                    </Text>
                  </View>
                  {challenge.completed ? (
                    <View style={doneChip(scale)}>
                      <CheckCircleIcon size={15 * scale} circleColor={NutriColors.green} />
                      <Text style={doneChipText(scale)}>Done</Text>
                    </View>
                  ) : (
                    <Text style={joinChip(scale)}>Joined</Text>
                  )}
                </View>
                <Text style={challengeDescription(scale)}>{challenge.description}</Text>
                <View style={progressTrack(scale)}>
                  <LinearGradient
                    colors={['#B74FF5', '#753AFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{
                      width: `${Math.round((challenge.progress / challenge.days) * 100)}%`,
                      height: '100%',
                      borderRadius: 3,
                    }}
                  />
                </View>
                <View style={challengeMetaRow(scale)}>
                  <Text style={challengeMeta(scale)}>
                    {challenge.progress}/{challenge.days} days
                  </Text>
                  <Text style={challengeMeta(scale)}>🏆 {challenge.reward}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {tab === 'groups' ? (
          <View style={listWrap(scale)}>
            <Text style={groupSectionTitle(scale)}>Your Groups</Text>
            {groups.map((group) => (
              <View key={group.id} style={groupCard(scale)}>
                <View style={avatarStack(scale)}>
                  {group.avatars.map((avatar, index) => (
                    <Image
                      key={`${index}`}
                      source={avatar}
                      style={stackAvatar(scale, index)}
                      contentFit="cover"
                    />
                  ))}
                  <View style={[stackAvatar(scale, group.avatars.length), moreAvatar(scale)]}>
                    <Text style={moreAvatarText(scale)}>+{group.members - group.avatars.length}</Text>
                  </View>
                </View>
                <View style={styles.groupText}>
                  <View style={groupNameRow(scale)}>
                    <Text style={groupName(scale)}>{group.name}</Text>
                    <View style={kindChip(scale, group.kind)}>
                      <Text style={kindChipText(scale, group.kind)}>{group.kind}</Text>
                    </View>
                  </View>
                  <View style={groupMetaRow(scale)}>
                    <UsersIcon size={15 * scale} color={NutriColors.textFaint} />
                    <Text style={groupMeta(scale)}>{group.members} members</Text>
                    <SparkleIcon size={13 * scale} color={NutriColors.textFaint} />
                    <Text style={groupMeta(scale)}>{group.sharedRecipes} recipes shared</Text>
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={createGroupButton(scale)}>
              <PlusIcon size={20 * scale} />
              <Text style={createGroupText(scale)}>Create Group</Text>
            </Pressable>
            <Text style={createGroupHint(scale)}>
              Create a group with friends or family and share recipes with each other.
            </Text>

            <Text style={groupSectionTitle(scale)}>Your Recipe History</Text>
            {recipeHistory.map((entry) => {
              const recipe = getRecipeById(entry.recipeId);
              if (!recipe) return null;
              return (
                <Pressable
                  key={entry.recipeId}
                  onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
                  style={historyCard(scale)}>
                  <Image source={recipe.image} style={historyImage(scale)} contentFit="cover" />
                  <View style={styles.historyText}>
                    <Text style={historyName(scale)}>{recipe.name}</Text>
                    <Text style={historyDate(scale)}>Cooked {entry.cookedOn}</Text>
                  </View>
                  <Text style={historyKcal(scale)}>{recipe.kcal} kcal</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PostCard({
  post,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  scale,
}: {
  post: CommunityPost;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  scale: number;
}) {
  return (
    <View style={postCard(scale)}>
      <View style={postHeader(scale)}>
        <Image source={post.avatar} style={postAvatar(scale)} contentFit="cover" />
        <View style={styles.postHeadText}>
          <Text style={postAuthor(scale)}>{post.author}</Text>
          <Text style={postTime(scale)}>{post.timeAgo}</Text>
        </View>
        <Text style={postMenu(scale)}>⋯</Text>
      </View>

      <Text style={postText(scale)}>{post.text}</Text>

      {post.image ? (
        <Image source={post.image} style={postImage(scale)} contentFit="cover" />
      ) : null}

      <View style={postHashtagRow(scale)}>
        {post.hashtags.map((tag) => (
          <Text key={tag} style={postHashtag(scale)}>
            {tag}
          </Text>
        ))}
      </View>

      <View style={postActions(scale)}>
        <Pressable onPress={onLike} style={actionItem(scale)}>
          <HeartIcon size={20 * scale} color={liked ? '#FF5C7A' : NutriColors.textDim} filled={liked} />
          <Text style={[actionText(scale), liked && { color: '#FF5C7A' }]}>
            {(post.likes + (liked ? 1 : 0)).toLocaleString('en-US')}
          </Text>
        </Pressable>
        <View style={actionItem(scale)}>
          <CommentIcon size={20 * scale} color={NutriColors.textDim} />
          <Text style={actionText(scale)}>{post.comments}</Text>
        </View>
        <View style={actionItem(scale)}>
          <ShareIcon size={20 * scale} color={NutriColors.textDim} />
          <Text style={actionText(scale)}>Share</Text>
        </View>
        <Pressable onPress={onBookmark} style={styles.bookmarkButton}>
          <BookmarkIcon
            size={20 * scale}
            color={bookmarked ? NutriColors.purple : NutriColors.textDim}
            filled={bookmarked}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  root: {
    flex: 1,
    backgroundColor: NutriColors.bg,
  } as ViewStyle,
  segmentTextActive: {
    color: '#FFFFFF',
  } as TextStyle,
  bannerText: {
    flex: 1,
  } as ViewStyle,
  challengeHeadText: {
    flex: 1,
  } as ViewStyle,
  groupText: {
    flex: 1,
  } as ViewStyle,
  historyText: {
    flex: 1,
  } as ViewStyle,
  postHeadText: {
    flex: 1,
  } as ViewStyle,
  bookmarkButton: {
    marginLeft: 'auto',
  } as ViewStyle,
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

const segmentWrap = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 8 * scale,
  marginTop: 20 * scale,
  paddingHorizontal: 26 * scale,
});

const segmentButton = (active: boolean, scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12 * scale,
  borderRadius: 14 * scale,
  backgroundColor: active ? 'transparent' : NutriColors.card,
  borderWidth: 1.2,
  borderColor: active ? 'transparent' : NutriColors.borderMuted,
  overflow: 'hidden',
});

const segmentGradient = (scale: number): ViewStyle => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 14 * scale,
});

const segmentText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14.5 * scale,
  fontWeight: '700',
});

const listWrap = (scale: number): ViewStyle => ({
  gap: 16 * scale,
  marginTop: 20 * scale,
  paddingHorizontal: 26 * scale,
  paddingBottom: 150 * scale,
});

const challengeBanner = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  overflow: 'hidden',
});

const bannerGradient = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13 * scale,
  padding: 18 * scale,
});

const bannerTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
  fontWeight: '700',
});

const bannerBody = (scale: number): TextStyle => ({
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 13 * scale,
  marginTop: 3,
});

const postCard = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  padding: 16 * scale,
});

const postHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
});

const postAvatar = (scale: number): ImageStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 22 * scale,
});

const postAuthor = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15.5 * scale,
  fontWeight: '700',
});

const postTime = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginTop: 2,
});

const postMenu = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 22 * scale,
  paddingHorizontal: 6 * scale,
});

const postText = (scale: number): TextStyle => ({
  color: '#DDE3F0',
  fontSize: 14.5 * scale,
  lineHeight: 21 * scale,
  marginTop: 12 * scale,
});

const postImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 190 * scale,
  borderRadius: 15 * scale,
  marginTop: 12 * scale,
});

const postHashtagRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8 * scale,
  marginTop: 12 * scale,
});

const postHashtag = (scale: number): TextStyle => ({
  color: '#8FA7FF',
  fontSize: 12.5 * scale,
  fontWeight: '600',
  backgroundColor: 'rgba(46, 139, 255, 0.12)',
  paddingHorizontal: 10 * scale,
  paddingVertical: 5 * scale,
  borderRadius: 9 * scale,
  overflow: 'hidden',
});

const postActions = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 20 * scale,
  marginTop: 14 * scale,
  paddingTop: 13 * scale,
  borderTopWidth: 1,
  borderTopColor: NutriColors.divider,
});

const actionItem = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7 * scale,
});

const actionText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
});

const challengeCard = (scale: number): ViewStyle => ({
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  padding: 16 * scale,
});

const challengeTopRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
});

const challengeIconWrap = (scale: number): ViewStyle => ({
  width: 46 * scale,
  height: 46 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 172, 56, 0.13)',
});

const challengeName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const challengeParticipants = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginTop: 3,
});

const doneChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 10 * scale,
  paddingVertical: 6 * scale,
  borderRadius: 10 * scale,
  backgroundColor: 'rgba(0, 213, 138, 0.13)',
});

const doneChipText = (scale: number): TextStyle => ({
  color: NutriColors.green,
  fontSize: 12.5 * scale,
  fontWeight: '700',
});

const joinChip = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  paddingHorizontal: 12 * scale,
  paddingVertical: 6 * scale,
  borderRadius: 10 * scale,
  overflow: 'hidden',
});

const challengeDescription = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  lineHeight: 19 * scale,
  marginTop: 12 * scale,
});

const progressTrack = (scale: number): ViewStyle => ({
  height: 7 * scale,
  borderRadius: 4 * scale,
  backgroundColor: NutriColors.track,
  marginTop: 14 * scale,
  overflow: 'hidden',
});

const challengeMetaRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10 * scale,
});

const challengeMeta = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  fontWeight: '600',
});

const groupSectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
  marginTop: 8 * scale,
});

const groupCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13 * scale,
  borderRadius: 20 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  padding: 16 * scale,
});

const avatarStack = (scale: number): ViewStyle => ({
  width: 92 * scale,
  height: 40 * scale,
});

const stackAvatar = (scale: number, index: number): ImageStyle => ({
  position: 'absolute',
  left: index * 26 * scale,
  width: 40 * scale,
  height: 40 * scale,
  borderRadius: 20 * scale,
  borderWidth: 2,
  borderColor: NutriColors.card,
});

const moreAvatar = (scale: number): ViewStyle => ({
  backgroundColor: NutriColors.track,
  alignItems: 'center',
  justifyContent: 'center',
});

const moreAvatarText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12 * scale,
  fontWeight: '700',
});

const groupNameRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 9 * scale,
});

const groupName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 16 * scale,
  fontWeight: '700',
});

const kindChip = (scale: number, kind: 'Friends' | 'Family'): ViewStyle => ({
  paddingHorizontal: 9 * scale,
  paddingVertical: 4 * scale,
  borderRadius: 8 * scale,
  backgroundColor:
    kind === 'Family' ? 'rgba(0, 215, 197, 0.13)' : 'rgba(46, 139, 255, 0.14)',
});

const kindChipText = (scale: number, kind: 'Friends' | 'Family'): TextStyle => ({
  color: kind === 'Family' ? NutriColors.teal : '#8FB8FF',
  fontSize: 11 * scale,
  fontWeight: '700',
});

const groupMetaRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  marginTop: 8 * scale,
});

const groupMeta = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginRight: 8 * scale,
});

const createGroupButton = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9 * scale,
  height: 56 * scale,
  borderRadius: 17 * scale,
  borderWidth: 1.6,
  borderStyle: 'dashed',
  borderColor: 'rgba(183, 79, 245, 0.55)',
  backgroundColor: 'rgba(183, 79, 245, 0.07)',
});

const createGroupText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 15.5 * scale,
  fontWeight: '700',
});

const createGroupHint = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  textAlign: 'center',
  lineHeight: 18 * scale,
});

const historyCard = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13 * scale,
  borderRadius: 18 * scale,
  backgroundColor: NutriColors.card,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  padding: 12 * scale,
});

const historyImage = (scale: number): ImageStyle => ({
  width: 56 * scale,
  height: 56 * scale,
  borderRadius: 13 * scale,
});

const historyName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 15 * scale,
  fontWeight: '700',
});

const historyDate = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  marginTop: 3,
});

const historyKcal = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
});
