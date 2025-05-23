import axios from 'axios';

const API_URL = '/pattern-recognition';

// Create axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get heatmap visualization data
 * @param {number} userId - User ID
 * @param {number} modelId - Optional model ID
 * @param {number} timeWindow - Optional time window in days
 * @returns {Promise} - Promise with heatmap data
 */
export const getHeatmapData = async (userId, modelId = null, timeWindow = null) => {
  let url = `/visualizations/heatmap?user_id=${userId}`;
  if (modelId) url += `&model_id=${modelId}`;
  if (timeWindow) url += `&time_window=${timeWindow}`;
  
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
};

/**
 * Get Sankey diagram visualization data
 * @param {number} userId - User ID
 * @param {number} modelId - Optional model ID
 * @param {number} timeWindow - Optional time window in days
 * @returns {Promise} - Promise with Sankey diagram data
 */
export const getSankeyData = async (userId, modelId = null, timeWindow = null) => {
  let url = `/visualizations/sankey?user_id=${userId}`;
  if (modelId) url += `&model_id=${modelId}`;
  if (timeWindow) url += `&time_window=${timeWindow}`;
  
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Sankey diagram data:', error);
    throw error;
  }
};

/**
 * Get radar chart visualization data
 * @param {number} userId - User ID
 * @param {number} modelId - Optional model ID
 * @returns {Promise} - Promise with radar chart data
 */
export const getRadarData = async (userId, modelId = null) => {
  let url = `/visualizations/radar?user_id=${userId}`;
  if (modelId) url += `&model_id=${modelId}`;
  
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching radar chart data:', error);
    throw error;
  }
};

/**
 * Get timeline visualization data
 * @param {number} userId - User ID
 * @param {number} days - Number of days to include (default: 7)
 * @param {number} modelId - Optional model ID
 * @returns {Promise} - Promise with timeline data
 */
export const getTimelineData = async (userId, days = 7, modelId = null) => {
  let url = `/visualizations/timeline?user_id=${userId}&days=${days}`;
  if (modelId) url += `&model_id=${modelId}`;
  
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
};

/**
 * Get behavioral models for a user
 * @param {number} userId - User ID
 * @returns {Promise} - Promise with models data
 */
export const getUserModels = async (userId) => {
  try {
    const response = await axiosInstance.get(`/models?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user models:', error);
    throw error;
  }
};

export default {
  getHeatmapData,
  getSankeyData,
  getRadarData,
  getTimelineData,
  getUserModels,
  publishModel // Added publishModel
};

/**
 * Publish a behavioral model
 * @param {number} modelId - The ID of the model to publish
 * @returns {Promise} - Promise with the response from the server
 */
export const publishModel = async (modelId) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Use axios.post directly for a path outside the instance's baseURL
  // This ensures the request goes to /publish/model/{modelId}
  // instead of /pattern-recognition/publish/model/{modelId}
  try {
    const response = await axios.post(`/publish/model/${modelId}`, null, { headers });
    return response.data; // Return response.data directly for consistency with other services
  } catch (error) {
    console.error(`Error publishing model ${modelId}:`, error.response || error);
    throw error; // Re-throw the error to be caught by the calling component
  }
};