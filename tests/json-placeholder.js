export class JsonPlaceholderApi {
  constructor(request, baseUrl) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async getPost(postId) {
    return this.request.get(`${this.baseUrl}/posts/${postId}`);
  }

  async getUser(userId) {
    return this.request.get(`${this.baseUrl}/users/${userId}`);
  }

  async createPost(postData) {
    return this.request.post(`${this.baseUrl}/posts`, {
      data: postData,
    });
  }
}
