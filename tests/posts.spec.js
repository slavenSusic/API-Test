import { test as base, expect } from '@playwright/test';
import { JsonPlaceholderApi } from './json-placeholder';
import Ajv from 'ajv';
import { postSchema } from './schemas/post.schema.js';

const test = base.extend({
  api: async ({ request, baseURL }, use) => {
    await use(new JsonPlaceholderApi(request, baseURL));
  },
});

const postCases = [
  { postId: 1, expectedUserId: 1 },
  { postId: 11, expectedUserId: 2 },
  { postId: 21, expectedUserId: 3 },
];

test.describe('API tests', () => {
  for (const { postId, expectedUserId } of postCases) {
    test(`GET /posts/${postId} maps to user ${expectedUserId}`, async ({
      api,
    }) => {
      const postResponse = await api.getPost(postId);
      expect(postResponse.status()).toBe(200);

      const postData = await postResponse.json();
      expect(postData.id).toBe(postId);
      expect(postData.userId).toBe(expectedUserId);

      const userResponse = await api.getUser(postData.userId);
      expect(userResponse.status()).toBe(200);

      const userData = await userResponse.json();
      expect(userData.id).toBe(postData.userId);
    });
  }

  test('Validate State Persistence (POST /posts)', async ({
    api,
  }) => {
    const newPostData = {
      userId: 99,
      id: 99,
      title: 'Test Post',
      body: 'This is a test post.',
    };

    const postResponse =
      await api.createPost(newPostData);

    expect(postResponse.status()).toBe(201);

    const createdPost = await postResponse.json();

    expect(createdPost.title).toBe(
      newPostData.title,
    );
    expect(createdPost.body).toBe(
      newPostData.body,
    );
    expect(createdPost.userId).toBe(
      newPostData.userId,
    );
  });

  test('Validate GET /posts/{id} for created post', async ({
    api,
  }) => {
    const createdPostId = 99;

    const postResponse =
      await api.getPost(createdPostId);

    expect(postResponse.status()).toBe(200);

    const postData = await postResponse.json();
    console.log(postData.id);
  });

  test('GET /posts/{id} matches the post schema', async ({
    api,
  }) => {
    const response = await api.getPost(8);

    expect(response.status()).toBe(200);

    const post = await response.json();
    const ajv = new Ajv();
    const validate = ajv.compile(postSchema);
    const isValid = validate(post);

    expect(
      isValid,
      JSON.stringify(validate.errors, null, 2),
    ).toBe(true);
  });

  test('Validate non-existent post', async ({
    api,
  }) => {
    const wrongPostId = 9999;

    const postResponse =
      await api.getPost(wrongPostId);

    expect(postResponse.status()).toBe(404);
    expect(postResponse.ok()).toBe(false);

    const postData = await postResponse.json();
    expect(postData).toEqual({});
  });
});
