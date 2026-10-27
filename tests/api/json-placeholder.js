// Paths are relative to the project's baseURL (API_BASE_URL).
export class JsonPlaceholderApi {
  constructor(request) {
    this.request = request;
  }

  async getPosts(params) {
    return this.request.get('/posts', { params });
  }

  async getPost(postId) {
    return this.request.get(`/posts/${postId}`);
  }

  async getUser(userId) {
    return this.request.get(`/users/${userId}`);
  }

  async createPost(postData) {
    return this.request.post('/posts', { data: postData });
  }

  async updatePost(postId, postData) {
    return this.request.put(`/posts/${postId}`, { data: postData });
  }

  async patchPost(postId, fields) {
    return this.request.patch(`/posts/${postId}`, { data: fields });
  }

  async deletePost(postId) {
    return this.request.delete(`/posts/${postId}`);
  }
}
