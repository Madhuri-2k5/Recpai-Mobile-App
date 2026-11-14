import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { NutriColors } from '@/constants/nutri';
import { useAppFrame } from '@/hooks/use-app-frame';
import {
  CheckCircleIcon,
  CloseIcon,
  CommentIcon,
  HeartIcon,
  PlusIcon,
  ShareIcon,
  SparkleIcon,
  TrophyIcon,
  UsersIcon,
} from '@/components/icons';
import {
  api,
  type CommunityChallenge,
  type CommunityGroup,
  type CommunityPost,
  type Recipe,
} from '@/lib/api';

type CommunityTab = 'feed' | 'challenges' | 'groups';

export default function CommunityScreen() {
  const { scale } = useAppFrame();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; groupId?: string }>();
  const [tab, setTab] = useState<CommunityTab>(() => {
    if (params.tab === 'challenges' || params.tab === 'groups') return params.tab;
    return 'feed';
  });
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [completedChallenge, setCompletedChallenge] = useState<CommunityChallenge | null>(null);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [filterGroup, setFilterGroup] = useState<CommunityGroup | null>(null);

  // Create Group Modal
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupKind, setNewGroupKind] = useState<'Friends' | 'Family'>('Friends');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Share to Group Modal
  const [shareGroup, setShareGroup] = useState<CommunityGroup | null>(null);
  const [sharing, setSharing] = useState(false);

  // Create Post Modal
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedRecipeForPost, setSelectedRecipeForPost] = useState<Recipe | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);

  // Comments Modal
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const load = useCallback(async (groupId?: string) => {
    setLoading(true);
    try {
      const [postsPayload, challengesPayload, groupsPayload, recipesPayload] = await Promise.all([
        api.posts(groupId),
        api.challenges(),
        api.groups(),
        api.myRecipes(),
      ]);
      setPosts(postsPayload.posts);
      setChallenges(challengesPayload.challenges);
      setCompletedChallenge(challengesPayload.challenges.find((c) => c.completed) ?? null);
      setGroups(groupsPayload.groups);
      setMyRecipes(recipesPayload.recipes);
    } catch {
      // keep previous data on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (params.tab === 'feed' || params.tab === 'challenges' || params.tab === 'groups') {
        setTab(params.tab as CommunityTab);
      }
      load(filterGroup?.id);
    }, [load, filterGroup?.id, params.tab])
  );

  async function toggleLike(post: CommunityPost) {
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? { ...item, likedByMe: !item.likedByMe, likes: item.likes + (item.likedByMe ? -1 : 1) }
          : item
      )
    );
    try {
      await api.likePost(post.id);
    } catch {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, likedByMe: post.likedByMe, likes: post.likes } : item
        )
      );
    }
  }

  async function createGroup() {
    if (!newGroupName.trim() || creatingGroup) return;
    setCreatingGroup(true);
    try {
      await api.createGroup(newGroupName.trim(), newGroupKind);
      setCreateGroupVisible(false);
      setNewGroupName('');
      setNewGroupKind('Friends');
      await load(filterGroup?.id);
    } finally {
      setCreatingGroup(false);
    }
  }

  async function shareRecipe(group: CommunityGroup, recipe: Recipe) {
    if (sharing) return;
    setSharing(true);
    try {
      await api.shareToGroup(group.id, recipe._id || recipe.id || '');
      setShareGroup(null);
      await load(filterGroup?.id);
    } finally {
      setSharing(false);
    }
  }

  async function handleCreatePost() {
    if ((!newPostText.trim() && !selectedRecipeForPost) || creatingPost) return;
    setCreatingPost(true);
    try {
      await api.createPost({
        text: newPostText.trim() || undefined,
        recipeId: selectedRecipeForPost?._id || selectedRecipeForPost?.id || undefined,
        groupId: filterGroup?.id || undefined,
      });
      setCreatePostVisible(false);
      setNewPostText('');
      setSelectedRecipeForPost(null);
      await load(filterGroup?.id);
    } finally {
      setCreatingPost(false);
    }
  }

  async function handleAddComment() {
    if (!activeCommentPost || !newCommentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.addComment(activeCommentPost.id, newCommentText.trim());
      const updatedCommentList = [...(activeCommentPost.commentList || []), res.comment];
      const updatedPost = {
        ...activeCommentPost,
        comments: res.comments,
        commentList: updatedCommentList,
      };

      setActiveCommentPost(updatedPost);
      setPosts((current) =>
        current.map((p) => (p.id === activeCommentPost.id ? updatedPost : p))
      );
      setNewCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function joinOrProgress(challenge: CommunityChallenge) {
    try {
      if (!challenge.joined) {
        await api.joinChallenge(challenge.key);
      } else if (!challenge.completed) {
        await api.challengeProgress(challenge.key);
      }
      const refreshed = await api.challenges();
      setChallenges(refreshed.challenges);
      setCompletedChallenge(refreshed.challenges.find((item) => item.completed) ?? null);
    } catch {
      // ignore
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 * scale }}>
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

        {loading ? (
          <View style={loaderWrap(scale)}>
            <ActivityIndicator size="large" color={NutriColors.purple} />
          </View>
        ) : tab === 'feed' ? (
          <View style={listWrap(scale)}>
            {/* Action Bar: Create Post & Filter */}
            <View style={feedHeaderRow(scale)}>
              <View style={styles.feedHeadText}>
                <Text style={feedSectionTitle(scale)}>
                  {filterGroup ? `${filterGroup.name} Feed` : 'Community Feed'}
                </Text>
                {filterGroup ? (
                  <Pressable onPress={() => setFilterGroup(null)} style={clearFilterChip(scale)}>
                    <Text style={clearFilterText(scale)}>Clear filter (show all)</Text>
                    <CloseIcon size={12 * scale} color="#D9A8FF" />
                  </Pressable>
                ) : null}
              </View>

              <Pressable
                onPress={() => setCreatePostVisible(true)}
                style={createPostButton(scale)}>
                <LinearGradient
                  colors={['#B74FF5', '#753AFF']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={createPostGradient(scale)}>
                  <PlusIcon size={16 * scale} />
                  <Text style={createPostButtonText(scale)}>Share</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {completedChallenge ? (
              <View style={challengeBanner(scale)}>
                <LinearGradient
                  colors={['#8F3BF3', '#B74FF5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={bannerGradient(scale)}>
                  <CheckCircleIcon size={26 * scale} circleColor="#FFFFFF" checkColor="#7C3AED" />
                  <View style={styles.bannerText}>
                    <Text style={bannerTitle(scale)} numberOfLines={1}>
                      {completedChallenge.name}
                    </Text>
                    <Text style={bannerBody(scale)}>Completed — 200 points earned!</Text>
                  </View>
                  <TrophyIcon size={26 * scale} color="#FFD76B" />
                </LinearGradient>
              </View>
            ) : null}

            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike(post)}
                onComment={() => {
                  setActiveCommentPost(post);
                }}
                onSelectRecipe={(recipeId) => {
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: recipeId },
                  });
                }}
                scale={scale}
              />
            ))}

            {posts.length === 0 ? (
              <View style={emptyFeedWrap(scale)}>
                <SparkleIcon size={32 * scale} color={NutriColors.purple} />
                <Text style={emptyFeedTitle(scale)}>No posts yet</Text>
                <Text style={emptyFeedSubtitle(scale)}>
                  Be the first to share your recipe or healthy cooking progress with the community!
                </Text>
              </View>
            ) : null}
          </View>
        ) : tab === 'challenges' ? (
          <View style={listWrap(scale)}>
            {challenges.map((challenge) => (
              <View key={challenge.key} style={challengeCard(scale)}>
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
                    <Pressable onPress={() => joinOrProgress(challenge)} style={joinChip(scale)}>
                      <Text style={joinChipText(scale)}>{challenge.joined ? '+ 1 day' : 'Join'}</Text>
                    </Pressable>
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
                  <Text style={challengeMeta(scale)} numberOfLines={1}>
                    🏆 {challenge.reward}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={listWrap(scale)}>
            <Text style={groupSectionTitle(scale)}>Your Groups</Text>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                onPress={() => {
                  setFilterGroup(group);
                  setTab('feed');
                }}
                style={groupCard(scale)}>
                <View style={groupAvatarWrap(scale)}>
                  <UsersIcon size={24 * scale} color={NutriColors.blue} />
                </View>
                <View style={styles.groupText}>
                  <View style={groupNameRow(scale)}>
                    <Text style={groupName(scale)} numberOfLines={1}>
                      {group.name}
                    </Text>
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
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setShareGroup(group);
                  }}
                  style={shareButton(scale)}>
                  <ShareIcon size={16 * scale} color="#D9A8FF" />
                </Pressable>
              </Pressable>
            ))}

            {groups.length === 0 ? (
              <Text style={createGroupHint(scale)}>
                You have no groups yet. Create one with friends or family to share recipes.
              </Text>
            ) : null}

            <Pressable style={createGroupButton(scale)} onPress={() => setCreateGroupVisible(true)}>
              <PlusIcon size={20 * scale} />
              <Text style={createGroupText(scale)}>Create Group</Text>
            </Pressable>
            <Text style={createGroupHint(scale)}>
              Create a group with friends or family and share recipes with each other.
            </Text>

            <Text style={groupSectionTitle(scale)}>Your Recipe History</Text>
            {myRecipes.map((recipe) => (
              <Pressable
                key={recipe._id || recipe.id}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: recipe._id || recipe.id || '' },
                  })
                }
                style={historyCard(scale)}>
                {recipe.imageUrl ? (
                  <Image source={{ uri: recipe.imageUrl }} style={historyImage(scale)} contentFit="cover" />
                ) : (
                  <View style={[historyImage(scale), historyImagePlaceholder(scale)]}>
                    <SparkleIcon size={20 * scale} color={NutriColors.purple} />
                  </View>
                )}
                <View style={styles.historyText}>
                  <Text style={historyName(scale)} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <Text style={historyDate(scale)}>
                    {recipe.cuisine} • {recipe.prepTimeMinutes} min
                  </Text>
                </View>
                <Text style={historyKcal(scale)}>{recipe.nutrition.calories} kcal</Text>
              </Pressable>
            ))}
            {myRecipes.length === 0 ? (
              <Text style={createGroupHint(scale)}>Recipes you scan and add will show up here.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={createGroupVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateGroupVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setCreateGroupVisible(false)} />
          <View style={sheet(scale)}>
            <Text style={sheetTitle(scale)}>Create Group</Text>
            <Text style={sheetLabel(scale)}>Group name</Text>
            <TextInput
              style={sheetInput(scale)}
              placeholder="e.g. Family Recipes"
              placeholderTextColor={NutriColors.textFaint}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <Text style={sheetLabel(scale)}>Type</Text>
            <View style={kindRow(scale)}>
              {(['Friends', 'Family'] as const).map((kind) => (
                <Pressable
                  key={kind}
                  onPress={() => setNewGroupKind(kind)}
                  style={kindOption(newGroupKind === kind, scale)}>
                  <Text style={[kindOptionText(scale), newGroupKind === kind && styles.kindOptionTextActive]}>
                    {kind}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={createGroup} disabled={creatingGroup} style={sheetButton(scale)}>
              <Text style={sheetButtonText(scale)}>{creatingGroup ? 'Creating…' : 'Create Group'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Share Recipe Modal */}
      <Modal
        visible={shareGroup !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setShareGroup(null)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setShareGroup(null)} />
          <View style={sheet(scale)}>
            <Text style={sheetTitle(scale)}>Share to {shareGroup?.name}</Text>
            <Text style={sheetLabel(scale)}>Pick one of your recipes</Text>
            <ScrollView style={shareList(scale)} showsVerticalScrollIndicator={false}>
              {myRecipes.map((recipe) => (
                <Pressable
                  key={recipe._id || recipe.id}
                  onPress={() => shareGroup && shareRecipe(shareGroup, recipe)}
                  style={shareRow(scale)}>
                  <Text style={shareRowText(scale)} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <Text style={shareRowKcal(scale)}>{recipe.nutrition.calories} kcal</Text>
                </Pressable>
              ))}
              {myRecipes.length === 0 ? (
                <Text style={createGroupHint(scale)}>No recipes yet — scan a meal first.</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Community Post Modal */}
      <Modal
        visible={createPostVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreatePostVisible(false)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setCreatePostVisible(false)} />
          <View style={sheet(scale)}>
            <View style={modalHeader(scale)}>
              <Text style={sheetTitle(scale)}>Create Community Post</Text>
              <Pressable onPress={() => setCreatePostVisible(false)}>
                <CloseIcon size={20 * scale} />
              </Pressable>
            </View>

            <Text style={sheetLabel(scale)}>Your thoughts or recipe review</Text>
            <TextInput
              style={[sheetInput(scale), { height: 90 * scale, textAlignVertical: 'top' }]}
              multiline
              placeholder="What are you cooking or eating today? Share your thoughts…"
              placeholderTextColor={NutriColors.textFaint}
              value={newPostText}
              onChangeText={setNewPostText}
            />

            <Text style={sheetLabel(scale)}>Attach a recipe from your history (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={attachScroll(scale)}>
              {myRecipes.map((r) => {
                const isSelected = (selectedRecipeForPost?._id || selectedRecipeForPost?.id) === (r._id || r.id);
                return (
                  <Pressable
                    key={r._id || r.id}
                    onPress={() => setSelectedRecipeForPost(isSelected ? null : r)}
                    style={attachChip(isSelected, scale)}>
                    <Text style={attachChipText(isSelected, scale)} numberOfLines={1}>
                      {r.title}
                    </Text>
                    {isSelected ? <CheckCircleIcon size={14 * scale} circleColor={NutriColors.green} /> : null}
                  </Pressable>
                );
              })}
              {myRecipes.length === 0 ? (
                <Text style={attachEmptyText(scale)}>No saved recipes yet</Text>
              ) : null}
            </ScrollView>

            <Pressable
              onPress={handleCreatePost}
              disabled={creatingPost || (!newPostText.trim() && !selectedRecipeForPost)}
              style={sheetButton(scale)}>
              <Text style={sheetButtonText(scale)}>{creatingPost ? 'Posting…' : 'Post to Community'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Comments Thread Modal */}
      <Modal
        visible={activeCommentPost !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveCommentPost(null)}>
        <View style={modalBackdrop}>
          <Pressable style={styles.modalDismiss} onPress={() => setActiveCommentPost(null)} />
          <View style={[sheet(scale), { maxHeight: '82%' }]}>
            <View style={modalHeader(scale)}>
              <Text style={sheetTitle(scale)}>
                Comments ({activeCommentPost?.comments ?? 0})
              </Text>
              <Pressable onPress={() => setActiveCommentPost(null)}>
                <CloseIcon size={20 * scale} />
              </Pressable>
            </View>

            {activeCommentPost ? (
              <View style={commentPostPreview(scale)}>
                <Text style={commentPostAuthor(scale)}>{activeCommentPost.user.name}</Text>
                <Text style={commentPostText(scale)} numberOfLines={2}>
                  {activeCommentPost.text || activeCommentPost.recipe?.title || 'Shared recipe'}
                </Text>
              </View>
            ) : null}

            <ScrollView style={commentsList(scale)} showsVerticalScrollIndicator={false}>
              {activeCommentPost?.commentList && activeCommentPost.commentList.length > 0 ? (
                activeCommentPost.commentList.map((c) => (
                  <View key={c.id} style={commentRow(scale)}>
                    <View style={commentAvatar(scale)}>
                      <Text style={commentAvatarText(scale)}>{(c.userName[0] || 'U').toUpperCase()}</Text>
                    </View>
                    <View style={styles.commentBody}>
                      <View style={commentAuthorRow(scale)}>
                        <Text style={commentAuthor(scale)}>{c.userName}</Text>
                        <Text style={commentDate(scale)}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </View>
                      <Text style={commentContent(scale)}>{c.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={noCommentsWrap(scale)}>
                  <CommentIcon size={28 * scale} color={NutriColors.textFaint} />
                  <Text style={noCommentsText(scale)}>No comments yet. Start the conversation!</Text>
                </View>
              )}
            </ScrollView>

            <View style={addCommentRow(scale)}>
              <TextInput
                style={addCommentInput(scale)}
                placeholder="Write a comment…"
                placeholderTextColor={NutriColors.textFaint}
                value={newCommentText}
                onChangeText={setNewCommentText}
                onSubmitEditing={handleAddComment}
              />
              <Pressable
                onPress={handleAddComment}
                disabled={submittingComment || !newCommentText.trim()}
                style={sendCommentBtn(scale, !newCommentText.trim())}>
                <Text style={sendCommentBtnText(scale)}>
                  {submittingComment ? '…' : 'Send'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PostCard({
  post,
  onLike,
  onComment,
  onSelectRecipe,
  scale,
}: {
  post: CommunityPost;
  onLike: () => void;
  onComment: () => void;
  onSelectRecipe: (recipeId: string) => void;
  scale: number;
}) {
  return (
    <View style={postCard(scale)}>
      <View style={postHeader(scale)}>
        <View style={postAvatar(scale)}>
          <Text style={postAvatarText(scale)}>{(post.user.name[0] || 'U').toUpperCase()}</Text>
        </View>
        <View style={styles.postHeadText}>
          <Text style={postAuthor(scale)}>{post.user.name}</Text>
          <Text style={postTime(scale)}>
            {post.groupName ? `${post.groupName} • ` : ''}
            {post.timeAgo}
          </Text>
        </View>
      </View>

      {post.text ? <Text style={postText(scale)}>{post.text}</Text> : null}

      {post.recipe ? (
        <Pressable onPress={() => onSelectRecipe(post.recipe!.id)} style={recipeChip(scale)}>
          {post.recipe.imageUrl ? (
            <Image source={{ uri: post.recipe.imageUrl }} style={recipeChipImage(scale)} contentFit="cover" />
          ) : null}
          <View style={styles.recipeChipText}>
            <Text style={recipeChipName(scale)} numberOfLines={1}>
              {post.recipe.title}
            </Text>
            <Text style={recipeChipKcal(scale)}>{post.recipe.kcal} kcal</Text>
          </View>
        </Pressable>
      ) : post.image ? (
        <Image source={{ uri: post.image }} style={postImage(scale)} contentFit="cover" />
      ) : null}

      <View style={postActions(scale)}>
        <Pressable onPress={onLike} style={actionItem(scale)}>
          <HeartIcon
            size={20 * scale}
            color={post.likedByMe ? '#FF5C7A' : NutriColors.textDim}
            filled={post.likedByMe}
          />
          <Text style={[actionText(scale), post.likedByMe && { color: '#FF5C7A' }]}>
            {post.likes.toLocaleString('en-US')}
          </Text>
        </Pressable>

        <Pressable onPress={onComment} style={actionItem(scale)}>
          <CommentIcon size={20 * scale} color={NutriColors.textDim} />
          <Text style={actionText(scale)}>{post.comments}</Text>
        </Pressable>

        <View style={[actionItem(scale), styles.bookmarkButton]}>
          <ShareIcon size={20 * scale} color={NutriColors.textDim} />
        </View>
      </View>
    </View>
  );
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
  feedHeadText: {
    flex: 1,
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
  recipeChipText: {
    flex: 1,
  } as ViewStyle,
  commentBody: {
    flex: 1,
  } as ViewStyle,
  kindOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  } as TextStyle,
  modalDismiss: {
    flex: 1,
  } as ViewStyle,
};

const loaderWrap = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 90 * scale,
});

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

const feedHeaderRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12 * scale,
});

const feedSectionTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 18 * scale,
  fontWeight: '700',
});

const clearFilterChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  marginTop: 4 * scale,
});

const clearFilterText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 12 * scale,
  fontWeight: '600',
});

const createPostButton = (scale: number): ViewStyle => ({
  borderRadius: 14 * scale,
  overflow: 'hidden',
});

const createPostGradient = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 16 * scale,
  paddingVertical: 9 * scale,
});

const createPostButtonText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 13.5 * scale,
  fontWeight: '700',
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

const postAvatar = (scale: number): ViewStyle => ({
  width: 44 * scale,
  height: 44 * scale,
  borderRadius: 22 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(46, 139, 255, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(46, 139, 255, 0.4)',
});

const postAvatarText = (scale: number): TextStyle => ({
  color: '#8FB8FF',
  fontSize: 17 * scale,
  fontWeight: '700',
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

const postText = (scale: number): TextStyle => ({
  color: '#DDE3F0',
  fontSize: 14.5 * scale,
  lineHeight: 21 * scale,
  marginTop: 12 * scale,
});

const recipeChip = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12 * scale,
  marginTop: 12 * scale,
  padding: 10 * scale,
  borderRadius: 15 * scale,
  backgroundColor: NutriColors.input,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
});

const recipeChipImage = (scale: number): ImageStyle => ({
  width: 52 * scale,
  height: 52 * scale,
  borderRadius: 11 * scale,
  backgroundColor: NutriColors.card,
});

const recipeChipName = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 14.5 * scale,
  fontWeight: '700',
});

const recipeChipKcal = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 12.5 * scale,
  marginTop: 3,
});

const postImage = (scale: number): ImageStyle => ({
  width: '100%',
  height: 190 * scale,
  borderRadius: 15 * scale,
  marginTop: 12 * scale,
  backgroundColor: NutriColors.card,
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

const emptyFeedWrap = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 50 * scale,
  paddingHorizontal: 20 * scale,
  gap: 10 * scale,
});

const emptyFeedTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 17 * scale,
  fontWeight: '700',
});

const emptyFeedSubtitle = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
  textAlign: 'center',
  lineHeight: 20 * scale,
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

const joinChip = (scale: number): ViewStyle => ({
  paddingHorizontal: 12 * scale,
  paddingVertical: 8 * scale,
  borderRadius: 10 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.5)',
});

const joinChipText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
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
  gap: 10 * scale,
});

const challengeMeta = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  fontWeight: '600',
  flexShrink: 1,
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

const groupAvatarWrap = (scale: number): ViewStyle => ({
  width: 46 * scale,
  height: 46 * scale,
  borderRadius: 15 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(46, 139, 255, 0.14)',
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
  flexShrink: 1,
});

const kindChip = (scale: number, kind: 'Friends' | 'Family'): ViewStyle => ({
  paddingHorizontal: 9 * scale,
  paddingVertical: 4 * scale,
  borderRadius: 8 * scale,
  backgroundColor: kind === 'Family' ? 'rgba(0, 215, 197, 0.13)' : 'rgba(46, 139, 255, 0.14)',
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

const shareButton = (scale: number): ViewStyle => ({
  width: 40 * scale,
  height: 40 * scale,
  borderRadius: 13 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(183, 79, 245, 0.14)',
  borderWidth: 1,
  borderColor: 'rgba(183, 79, 245, 0.45)',
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
  backgroundColor: NutriColors.input,
});

const historyImagePlaceholder = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
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

const sheet = (scale: number): ViewStyle => ({
  backgroundColor: NutriColors.card,
  borderTopWidth: 1.3,
  borderLeftWidth: 1.3,
  borderRightWidth: 1.3,
  borderColor: 'rgba(22, 139, 255, 0.55)',
  borderTopLeftRadius: 26 * scale,
  borderTopRightRadius: 26 * scale,
  paddingHorizontal: 20 * scale,
  paddingTop: 20 * scale,
  paddingBottom: 30 * scale,
});

const modalHeader = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8 * scale,
});

const sheetTitle = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 19 * scale,
  fontWeight: '700',
});

const sheetLabel = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: '600',
  marginTop: 14 * scale,
  marginBottom: 8 * scale,
});

const sheetInput = (scale: number): TextStyle => ({
  backgroundColor: NutriColors.input,
  borderRadius: 14 * scale,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 14 * scale,
  paddingVertical: 12 * scale,
  color: '#FFFFFF',
  fontSize: 15 * scale,
});

const kindRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
});

const kindOption = (active: boolean, scale: number): ViewStyle => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 12 * scale,
  borderRadius: 13 * scale,
  backgroundColor: active ? 'rgba(183, 79, 245, 0.18)' : NutriColors.input,
  borderWidth: 1.4,
  borderColor: active ? NutriColors.purple : NutriColors.borderMuted,
});

const kindOptionText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 14 * scale,
});

const sheetButton = (scale: number): ViewStyle => ({
  marginTop: 20 * scale,
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

const shareList = (scale: number): ViewStyle => ({
  maxHeight: 260 * scale,
});

const shareRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12 * scale,
  paddingVertical: 13 * scale,
  borderBottomWidth: 1,
  borderBottomColor: NutriColors.divider,
});

const shareRowText = (scale: number): TextStyle => ({
  color: '#E9EDF8',
  fontSize: 15 * scale,
  fontWeight: '600',
  flex: 1,
});

const shareRowKcal = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13 * scale,
});

const attachScroll = (scale: number): ViewStyle => ({
  maxHeight: 52 * scale,
  marginBottom: 6 * scale,
});

const attachChip = (selected: boolean, scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6 * scale,
  paddingHorizontal: 14 * scale,
  paddingVertical: 10 * scale,
  borderRadius: 12 * scale,
  backgroundColor: selected ? 'rgba(183, 79, 245, 0.22)' : NutriColors.input,
  borderWidth: 1,
  borderColor: selected ? NutriColors.purple : NutriColors.borderMuted,
  marginRight: 8 * scale,
});

const attachChipText = (selected: boolean, scale: number): TextStyle => ({
  color: selected ? '#FFFFFF' : NutriColors.textDim,
  fontSize: 13 * scale,
  fontWeight: selected ? '700' : '500',
  maxWidth: 160 * scale,
});

const attachEmptyText = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 12.5 * scale,
  fontStyle: 'italic',
  paddingVertical: 8 * scale,
});

const commentPostPreview = (scale: number): ViewStyle => ({
  padding: 12 * scale,
  borderRadius: 14 * scale,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  marginBottom: 14 * scale,
});

const commentPostAuthor = (scale: number): TextStyle => ({
  color: '#8FB8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
});

const commentPostText = (scale: number): TextStyle => ({
  color: '#DDE3F0',
  fontSize: 13 * scale,
  marginTop: 3 * scale,
});

const commentsList = (scale: number): ViewStyle => ({
  maxHeight: 280 * scale,
});

const commentRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  gap: 10 * scale,
  paddingVertical: 10 * scale,
  borderBottomWidth: 1,
  borderBottomColor: NutriColors.divider,
});

const commentAvatar = (scale: number): ViewStyle => ({
  width: 34 * scale,
  height: 34 * scale,
  borderRadius: 17 * scale,
  backgroundColor: 'rgba(183, 79, 245, 0.16)',
  alignItems: 'center',
  justifyContent: 'center',
});

const commentAvatarText = (scale: number): TextStyle => ({
  color: '#D9A8FF',
  fontSize: 13 * scale,
  fontWeight: '700',
});

const commentAuthorRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const commentAuthor = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 13.5 * scale,
  fontWeight: '600',
});

const commentDate = (scale: number): TextStyle => ({
  color: NutriColors.textFaint,
  fontSize: 11.5 * scale,
});

const commentContent = (scale: number): TextStyle => ({
  color: '#D7DCEA',
  fontSize: 13 * scale,
  lineHeight: 18 * scale,
  marginTop: 2 * scale,
});

const noCommentsWrap = (scale: number): ViewStyle => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 36 * scale,
  gap: 8 * scale,
});

const noCommentsText = (scale: number): TextStyle => ({
  color: NutriColors.textDim,
  fontSize: 13.5 * scale,
});

const addCommentRow = (scale: number): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10 * scale,
  marginTop: 14 * scale,
});

const addCommentInput = (scale: number): TextStyle => ({
  flex: 1,
  height: 46 * scale,
  borderRadius: 14 * scale,
  backgroundColor: NutriColors.input,
  borderWidth: 1,
  borderColor: NutriColors.borderMuted,
  paddingHorizontal: 14 * scale,
  color: '#FFFFFF',
  fontSize: 14 * scale,
});

const sendCommentBtn = (scale: number, disabled: boolean): ViewStyle => ({
  height: 46 * scale,
  paddingHorizontal: 18 * scale,
  borderRadius: 14 * scale,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: disabled ? 'rgba(255, 255, 255, 0.05)' : NutriColors.purple,
});

const sendCommentBtnText = (scale: number): TextStyle => ({
  color: '#FFFFFF',
  fontSize: 14 * scale,
  fontWeight: '700',
});
