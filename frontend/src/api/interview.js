import api from './index';

export const createSession = (resumeText) => api.post('/interview/sessions', { resumeText });

// payload is either { questionIndex, answer } or { questionIndex, videoBase64 }
export const evaluateAnswer = (sessionId, _qIdx, payload) =>
    api.post(`/interview/sessions/${sessionId}/evaluate`, payload);

export const getSessions = () => api.get('/interview/sessions');
export const getSession = (sessionId) => api.get(`/interview/sessions/${sessionId}`);
