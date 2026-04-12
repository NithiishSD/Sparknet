import api from './axios';

export const postApi = {
  getFeed: () => api.get('/posts/feed'),
  createPost: (data) => api.post('/posts/create', data),
  getPost: (id) => api.get(`/posts/${id}`),
  editPost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  
  // Interactions
  likePost: (postId) => api.post('/posts/react', { postId }),
  unlikePost: (postId) => api.delete(`/posts/${postId}/react`),
  savePost: (postId) => api.post(`/posts/${postId}/save`),
  unsavePost: (postId) => api.delete(`/posts/${postId}/save`),
  
  // Comments
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, content) => api.post('/posts/comment', { postId, content }),
  replyToComment: (commentId, content) => api.post(`/posts/comments/${commentId}/reply`, { content }),
  deleteComment: (commentId) => api.delete(`/posts/comments/${commentId}`),
  
  // User specific
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getSavedPosts: () => api.get('/posts/saved'),
  getReplies: (commentId) => api.get(`/posts/comments/${commentId}/replies`),
  getLikes: (postId) => api.get(`/posts/${postId}/likes`),
  reportPost: (postId, reason, category) => api.post('/posts/report', { postId, reason, category }),
};
