import api from './axios';

export const profileApi = {
  getMyProfile: () => api.get('/profiles'),
  updateProfile: (formData) => api.put('/profiles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPublicProfile: (username) => api.get(`/profiles/${username}`),
  updatePrivacy: (privacy) => api.put('/profiles/privacy', privacy),
  getActivity: () => api.get('/profiles/activity'),
  resetProfile: () => api.delete('/profiles/reset'),
  
  // User Search & Connections
  searchUsers: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`),
  followUser: (targetId) => api.post('/users/follow', { targetId }),
  unfollowUser: (targetId) => api.delete(`/users/follow/${targetId}`),
  getFollowers: (targetId) => api.get(`/users/${targetId}/followers`),
  getFollowing: () => api.get('/users/following'),
  getConnectionStatuses: () => api.get('/users/connection-statuses'),
};
