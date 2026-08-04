import api from './index';

export const createSession = (resumeText, difficulty = 'medium') => api.post('/interview/sessions', { resumeText, difficulty });

// payload is either JSON { questionIndex, answer } or FormData containing { audio, questionIndex, visualMetrics }
export const evaluateAnswer = (sessionId, _qIdx, payload) =>
    api.post(`/interview/sessions/${sessionId}/evaluate`, payload, {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });

export const getSessions = () => api.get('/interview/sessions');
export const getSession = (sessionId) => api.get(`/interview/sessions/${sessionId}`);
