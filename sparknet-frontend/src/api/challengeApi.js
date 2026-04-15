import api from './axios';

export const challengeApi = {
  getChallenges: () => api.get('/challenges'),
  getChallenge: (id) => api.get(`/challenges/${id}`),
  joinChallenge: (challengeId) => api.post('/challenges/join', { challengeId }),
  submitEntry: (id, entryText) => api.post(`/challenges/${id}/submit`, { entryText }),
  voteChallenge: (id, candidateId) => api.post(`/challenges/${id}/vote`, { candidateId }),
  createChallenge: (data) => api.post('/challenges', data),
};
