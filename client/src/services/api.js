import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  loginWithGoogle: async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Upload endpoints
export const uploadAPI = {
  startUpload: async (fileCount) => {
    const response = await api.post('/uploads/start', { file_count: fileCount });
    return response.data; // { upload_id, signed_urls }
  },

  uploadToS3: async (signedUrl, file, onProgress) => {
    return axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  completeUpload: async (uploadId) => {
    const response = await api.post(`/uploads/${uploadId}/complete`);
    return response.data;
  },

  getUploadStatus: async (uploadId) => {
    const response = await api.get(`/uploads/${uploadId}/status`);
    return response.data; // { status, processed_count, total_count }
  },
};

// Clothing items endpoints
export const clothingAPI = {
  getPendingItems: async () => {
    const response = await api.get('/clothing-items/pending');
    return response.data;
  },

  updateItem: async (itemId, updates) => {
    const response = await api.patch(`/clothing-items/${itemId}`, updates);
    return response.data;
  },

  approveItem: async (itemId) => {
    const response = await api.patch(`/clothing-items/${itemId}`, { status: 'approved' });
    return response.data;
  },

  rejectItem: async (itemId) => {
    const response = await api.patch(`/clothing-items/${itemId}`, { status: 'rejected' });
    return response.data;
  },

  deleteItem: async (itemId) => {
    const response = await api.delete(`/clothing-items/${itemId}`);
    return response.data;
  },
};

// Wardrobe endpoints
export const wardrobeAPI = {
  getItems: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/wardrobe', { params });
    return response.data;
  },

  getItem: async (itemId) => {
    const response = await api.get(`/wardrobe/${itemId}`);
    return response.data;
  },
};

// Outfits endpoints
export const outfitsAPI = {
  generateOutfits: async (occasion) => {
    const response = await api.post('/outfits/generate', { occasion });
    return response.data;
  },

  saveOutfit: async (outfitId) => {
    const response = await api.post(`/outfits/${outfitId}/save`);
    return response.data;
  },

  unsaveOutfit: async (outfitId) => {
    const response = await api.delete(`/outfits/${outfitId}`);
    return response.data;
  },

  getSavedOutfits: async () => {
    const response = await api.get('/outfits');
    return response.data;
  },
};

export default api;
