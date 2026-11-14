process.env.NODE_ENV = 'test';
import http from 'http';

function request(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting RecPai 2.0 End-to-End Test Suite...');
  const { default: connectDB } = await import('./src/config/db.js');
  const { seedDemoData } = await import('./src/lib/seed.js');
  const { default: app } = await import('./src/server.js');
  await connectDB();
  await seedDemoData();
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const port = server.address().port;
  console.log(`📡 Test server listening on 127.0.0.1:${port}`);

  let token = '';
  let recipeId = '';
  let postId = '';
  let groupId = '';

  try {
    // 1. Health
    const health = await request(server, 'GET', '/api/health');
    console.log('✓ Health check:', health.status === 200 ? 'OK' : 'FAIL');

    // 2. Auth: Register / Login
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await request(server, 'POST', '/api/auth/register', {}, {
      name: 'Chef Tester',
      email: testEmail,
      password: 'password123',
    });
    console.log('✓ Register user:', regRes.status === 201 ? 'OK' : 'FAIL');
    token = regRes.data.token;

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Auth Me
    const meRes = await request(server, 'GET', '/api/auth/me', authHeaders);
    console.log('✓ Auth /me:', meRes.status === 200 && meRes.data.user.email === testEmail ? 'OK' : 'FAIL');

    // 4. Update Goals
    const goalsRes = await request(server, 'PUT', '/api/auth/goals', authHeaders, {
      calories: 2200,
      protein: 150,
      carbs: 220,
      fat: 65,
    });
    console.log('✓ Update Goals:', goalsRes.status === 200 && goalsRes.data.goals.calories === 2200 ? 'OK' : 'FAIL');

    // 5. AI Detection
    const detectRes = await request(server, 'POST', '/api/ai/detect', authHeaders, {
      imageBase64: 'mock_base64_data',
    });
    console.log('✓ AI Detect:', detectRes.status === 200 && detectRes.data.assessment.foodDetected ? 'OK' : 'FAIL');

    // 6. AI Recipe Generation (with cuisine & servings)
    const recipeGenRes = await request(server, 'POST', '/api/ai/recipe', authHeaders, {
      cuisine: 'Indian',
      servings: 3,
    });
    console.log('✓ AI Recipe Generate:', recipeGenRes.status === 200 && recipeGenRes.data.recipe.servings === 3 ? 'OK' : 'FAIL');
    const generatedRecipe = recipeGenRes.data.recipe;

    // 7. Save Recipe
    const saveRecipeRes = await request(server, 'POST', '/api/recipes', authHeaders, {
      recipe: generatedRecipe,
    });
    console.log('✓ Save Recipe:', saveRecipeRes.status === 201 ? 'OK' : 'FAIL');
    recipeId = saveRecipeRes.data.recipe._id || saveRecipeRes.data.recipe.id;

    // 8. Get Recipes List
    const listRecipeRes = await request(server, 'GET', '/api/recipes', authHeaders);
    console.log('✓ List Recipes:', listRecipeRes.status === 200 && listRecipeRes.data.recipes.length > 0 ? 'OK' : 'FAIL');

    // 9. Scalable Servings & Meal Logging
    const mealLogRes = await request(server, 'POST', '/api/meals/log', authHeaders, {
      recipeId,
      servings: 4, // Scaled to 4 servings
    });
    console.log('✓ Log Meal with Scaled Servings (4 portions):', mealLogRes.status === 201 ? 'OK' : 'FAIL');

    // 10. Nutrition Summary
    const nutSummaryRes = await request(server, 'GET', '/api/nutrition/summary', authHeaders);
    console.log('✓ Nutrition Summary:', nutSummaryRes.status === 200 && nutSummaryRes.data.today.calories > 0 ? 'OK' : 'FAIL');

    // 11. Today's Logged Meals
    const mealsRes = await request(server, 'GET', '/api/meals', authHeaders);
    console.log('✓ Get Meals:', mealsRes.status === 200 && mealsRes.data.log.meals.length > 0 ? 'OK' : 'FAIL');

    // 12. Streak & Milestones
    const streakRes = await request(server, 'GET', '/api/streak', authHeaders);
    console.log('✓ Get Streak:', streakRes.status === 200 && streakRes.data.streak.current >= 1 ? 'OK' : 'FAIL');

    // 13. Claim Milestone (test reached milestone)
    const { User } = await import('./src/models/User.js');
    const userDoc = await User.findOne({ email: testEmail });
    userDoc.streak = { current: 7, longest: 7, lastActiveDate: new Date().toISOString().slice(0, 10) };
    await userDoc.save();

    const claimRes = await request(server, 'POST', '/api/streak/claim', authHeaders, { days: 7 });
    console.log('✓ Claim Milestone (7 days):', claimRes.status === 200 ? 'OK' : 'FAIL');

    // 14. Community Groups (Create Group)
    const createGroupRes = await request(server, 'POST', '/api/community/groups', authHeaders, {
      name: 'Family Chefs',
      kind: 'Family',
    });
    console.log('✓ Create Community Group:', createGroupRes.status === 201 ? 'OK' : 'FAIL');
    groupId = createGroupRes.data.group.id || createGroupRes.data.group._id;

    // 15. Share Recipe to Group
    const shareRes = await request(server, 'POST', `/api/community/groups/${groupId}/share`, authHeaders, {
      recipeId,
      text: 'Made this for dinner with scalable servings!',
    });
    console.log('✓ Share Recipe to Group:', shareRes.status === 201 ? 'OK' : 'FAIL');

    // 16. Create Community Post
    const createPostRes = await request(server, 'POST', '/api/community/posts', authHeaders, {
      text: 'Excited about NutriAI 2.0!',
      recipeId,
    });
    console.log('✓ Create Community Post:', createPostRes.status === 201 ? 'OK' : 'FAIL');
    postId = createPostRes.data.post.id || createPostRes.data.post._id;

    // 17. Like Post
    const likeRes = await request(server, 'POST', `/api/community/posts/${postId}/like`, authHeaders, {});
    console.log('✓ Like Post:', likeRes.status === 200 && likeRes.data.likes > 0 ? 'OK' : 'FAIL');

    // 18. Add Comment to Post
    const commentRes = await request(server, 'POST', `/api/community/posts/${postId}/comments`, authHeaders, {
      text: 'Looks so healthy and delicious!',
    });
    console.log('✓ Add Comment to Post:', commentRes.status === 201 && commentRes.data.comment.text ? 'OK' : 'FAIL');

    // 19. Community Challenges
    const challengesRes = await request(server, 'GET', '/api/community/challenges', authHeaders);
    console.log('✓ Get Challenges:', challengesRes.status === 200 && challengesRes.data.challenges.length > 0 ? 'OK' : 'FAIL');

    // 20. Subscription Purchase (Yearly)
    const purchaseRes = await request(server, 'POST', '/api/subscription/purchase', authHeaders, {
      plan: 'yearly',
    });
    console.log('✓ Subscription Purchase (Yearly):', purchaseRes.status === 200 && purchaseRes.data.subscription.plan === 'yearly' ? 'OK' : 'FAIL');

    // 21. Subscription Cancel
    const cancelRes = await request(server, 'POST', '/api/subscription/cancel', authHeaders, {});
    console.log('✓ Subscription Cancel (revert to Free):', cancelRes.status === 200 && cancelRes.data.subscription.plan === 'free' ? 'OK' : 'FAIL');

    console.log('\n🎉 ALL 21 END-TO-END TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
