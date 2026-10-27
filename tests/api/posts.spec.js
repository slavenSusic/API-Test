import { test as base, expect } from '@playwright/test';
import Ajv from 'ajv';
import { JsonPlaceholderApi } from './json-placeholder';
import { postSchema } from './schemas/post.schema.js';

const test = base.extend({
  api: async ({ request }, use) => {
    await use(new JsonPlaceholderApi(request));
  },
});

const validatePost = new Ajv().compile(postSchema);

function expectValidPost(post) {
  expect(
    validatePost(post),
    JSON.stringify(validatePost.errors, null, 2),
  ).toBe(true);
}

const postCases = [
  { postId: 1, expectedUserId: 1 },
  { postId: 11, expectedUserId: 2 },
  { postId: 21, expectedUserId: 3 },
];

// JSONPlaceholder fakes writes: it echoes the request but never stores it.
const newPost = {
  userId: 1,
  title: 'Test Post',
  body: 'This is a test post.',
};

test.describe('Posts API', () => {
  for (const { postId, expectedUserId } of postCases) {
    test(`GET /posts/${postId} maps to user ${expectedUserId}`, async ({
      api,
    }) => {
      const postResponse = await api.getPost(postId);
      expect(postResponse).toBeOK();

      const postData = await postResponse.json();
      expect(postData.id).toBe(postId);
      expect(postData.userId).toBe(expectedUserId);

      const userResponse = await api.getUser(postData.userId);
      expect(userResponse).toBeOK();

      const userData = await userResponse.json();
      expect(userData.id).toBe(postData.userId);
    });
  }

  test('GET /posts/{id} matches the post schema', async ({ api }) => {
    const response = await api.getPost(8);
    expect(response).toBeOK();

    expectValidPost(await response.json());
  });

  test('GET /posts returns 100 posts that match the schema', async ({
    api,
  }) => {
    const response = await api.getPosts();
    expect(response).toBeOK();

    const posts = await response.json();
    expect(posts).toHaveLength(100);
    posts.forEach(expectValidPost);
  });

  test('GET /posts?userId=1 returns only that user\'s posts', async ({
    api,
  }) => {
    const response = await api.getPosts({ userId: 1 });
    expect(response).toBeOK();

    const posts = await response.json();
    expect(posts).toHaveLength(10);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('GET /posts/{id} returns 404 for a non-existent post', async ({
    api,
  }) => {
    const response = await api.getPost(9999);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({});
  });

  test('POST /posts returns the created post with a new id', async ({
    api,
  }) => {
    const response = await api.createPost(newPost);
    expect(response.status()).toBe(201);

    const createdPost = await response.json();
    expect(createdPost).toEqual({ ...newPost, id: 101 });
    expectValidPost(createdPost);
  });

  test('POST /posts does not persist the created post', async ({ api }) => {
    const createResponse = await api.createPost(newPost);
    const { id } = await createResponse.json();

    const getResponse = await api.getPost(id);
    expect(getResponse.status()).toBe(404);
  });

  test('PUT /posts/{id} replaces the post', async ({ api }) => {
    const response = await api.updatePost(1, { ...newPost, id: 1 });
    expect(response).toBeOK();

    expect(await response.json()).toEqual({ ...newPost, id: 1 });
  });

  test('PATCH /posts/{id} updates only the given fields', async ({ api }) => {
    const original = await (await api.getPost(1)).json();

    const response = await api.patchPost(1, { title: 'Patched title' });
    expect(response).toBeOK();

    expect(await response.json()).toEqual({
      ...original,
      title: 'Patched title',
    });
  });

  test('DELETE /posts/{id} succeeds', async ({ api }) => {
    const response = await api.deletePost(1);

    expect(response).toBeOK();
    expect(await response.json()).toEqual({});
  });
});
