import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = {
  // Canvas operations
  getCanvases: () => axios.get(`${API_BASE_URL}/canvases`),
  getCanvas: (id) => axios.get(`${API_BASE_URL}/canvases/${id}`),
  createCanvas: (title) => axios.post(`${API_BASE_URL}/canvases`, { title }),
  updateCanvasItems: (id, items) => axios.put(`${API_BASE_URL}/canvases/${id}/items`, { items }),

  // Session operations
  createSession: (canvasId, userName) => axios.post(`${API_BASE_URL}/sessions`, { canvasId, userName }),
  getActiveUsers: (canvasId) => axios.get(`${API_BASE_URL}/sessions/${canvasId}`)
};

export default api;</content>
<parameter name="filePath">c:\Users\tksna\OneDrive\ドキュメント\04_Codex\06_HypothesisCanvas\frontend\src\services\api.js