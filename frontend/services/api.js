import axios from 'axios';

export const API_URL = 'http://10.52.222.19:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AUTH
export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  uploadAvatar: (userId, imageUri) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('file', { uri: imageUri, name: filename, type });
    return api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// DASHBOARD
export const dashboardService = {
  getStats: (userId) => api.get(`/dashboard-stats/${userId}`),
};

// PANTRY
export const pantryService = {
  getAll: (userId, category) =>
    api.get(`/pantry-items/${userId}`, {
      params: category ? { category } : {},
    }),

  addItem: (userId, item) => api.post(`/pantry-items/${userId}`, item),

  updateItem: (itemId, data) => api.put(`/pantry-items/${itemId}`, data),

  deleteItem: (itemId) => api.delete(`/pantry-items/${itemId}`),
};

// SCANNER
export const scannerService = {
  analyzeImage: (userId, formData) =>
    api.post('/scanner/analyze-food', formData, {
      params: { user_id: userId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  saveHistory: (userId, data) =>
    api.post(`/scanner/save-history/${userId}`, data),

  getHistory: (userId) => api.get(`/scanner/history/${userId}`),
};

// RECIPES
export const recipeService = {
  generate: (userId, ingredients) =>
    api.post('/recipes/generate', {
      user_id: userId,
      ingredients,
    }),

  save: (userId, data) => api.post(`/recipes/save/${userId}`, data),

  getAll: (userId) => api.get(`/recipes/${userId}`),

  delete: (recipeId) => api.delete(`/recipes/${recipeId}`),
};

// MEAL PLANNER
export const mealPlanService = {
  getPlans: (userId) => api.get(`/meal-plans/all/${userId}`),

  getPlanByDate: (userId, dateStr) => api.get(`/meal-plans/${userId}`, { params: { target_date: dateStr } }),

  createPlan: (userId, data) => api.post(`/meal-plans`, data, { params: { user_id: userId } }),

  getItems: (planId) => api.get(`/meal-plans/items/${planId}`),

  generatePlan: (userId, dateStr) => api.post(`/meal-plans/generate`, { user_id: userId, date: dateStr }),

  replaceMeal: (userId, planId, mealType) => api.post(`/meal-plans/replace`, { user_id: userId, meal_plan_id: planId, meal_type: mealType }),

  completeItem: (itemId) => api.put(`/meal-plans/meal-items/${itemId}/complete`),

  updateItem: (itemId, data) => api.put(`/meal-plans/meal-items/${itemId}`, data),

  deleteItem: (itemId) => api.delete(`/meal-plans/meal-items/${itemId}`),

  submitFeedback: (userId, data) => api.post(`/meal-plans/feedback`, data, { params: { user_id: userId } }),

  addCustomMeal: (data) => api.post(`/meal-plans/custom-meal`, data),
};

// GROCERY
export const groceryService = {
  getLists: (userId) => api.get(`/grocery-items/${userId}`),

  createList: (userId, data) =>
    api.post(`/grocery-items/${userId}`, {
      name: data.name || 'My Grocery List',

      items: (data.items || []).map((item) => ({
        name: item.name || item.item_name || '',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),

      total_price: Number(data.total_price || data.totalPrice || 0),
    }),

  updateItem: (itemId, data) =>
    api.put(`/grocery-items/${itemId}`, {
      name: data.name || 'My Grocery List',

      items: (data.items || []).map((item) => ({
        name: item.name || item.item_name || '',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),

      total_price: Number(data.total_price || data.totalPrice || 0),
    }),

  deleteItem: (itemId) => api.delete(`/grocery-items/${itemId}`),
};

// NOTIFICATIONS
export const notificationService = {
  getAll: (userId) => api.get(`/notifications/${userId}`),

  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
};

// PROFILE
export const profileService = {
  getProfile: (userId) => api.get(`/profile/${userId}`),

  updateProfile: (userId, data) => api.put(`/profile/${userId}`, data),

  getDietPreferences: (userId) => api.get(`/diet-preferences/${userId}`),

  updateDietPreferences: (userId, data) => {
    const preference =
      typeof data === 'string'
        ? data
        : data?.preference ||
        data?.dietPreference ||
        data?.diet_type ||
        data?.dietType ||
        data?.selectedDiet ||
        data?.selectedPreference ||
        'Vegetarian';

    return api.put(`/diet-preferences/${userId}`, null, {
      params: { preference },
    });
  },

  getAllergies: (userId) => api.get(`/allergies/${userId}`),

  updateAllergies: async (userId, data) => {
    const selectedAllergies = Array.isArray(data) ? data : (data?.allergies || []);

    const currentResponse = await api.get(`/allergies/${userId}`);
    const currentData = currentResponse.data || [];

    const currentAllergies = currentData
      .map((item) => item.allergy || item.allergen || item.name || item.title)
      .filter(Boolean);

    const toAdd = selectedAllergies.filter(
      (item) => !currentAllergies.includes(item)
    );

    const toRemove = currentData.filter((item) => {
      const name = item.allergy || item.allergen || item.name || item.title;
      return name && !selectedAllergies.includes(name);
    });

    for (const allergyName of toAdd) {
      await api.post(`/allergies/${userId}`, {
        allergy: allergyName,
      });
    }

    for (const allergy of toRemove) {
      const allergyId = allergy.id || allergy.allergy_id;

      if (allergyId) {
        await api.delete(`/allergies/${allergyId}`);
      }
    }

    return {
      data: {
        success: true,
        allergies: selectedAllergies,
      },
    };
  },

  addAllergy: (userId, data) =>
    api.post(`/allergies/${userId}`, {
      allergy: data?.allergy || data?.allergen || data?.name || data,
    }),

  deleteAllergy: (allergyId) =>
    api.delete(`/allergies/${allergyId}`),

  getFamilyMembers: (userId) =>
    api.get(`/family-members/${userId}`),

  addFamilyMember: (userId, data) =>
    api.post(`/family-members/${userId}`, data),

  updateFamilyMember: (memberId, data) =>
    api.put(`/family-members/${memberId}`, data),

  deleteFamilyMember: (memberId) =>
    api.delete(`/family-members/${memberId}`),

  getPrivacySettings: (userId) =>
    api.get(`/privacy-settings/${userId}`),

  updatePrivacySettings: (userId, data) =>
    api.put(`/privacy-settings/${userId}`, data),

  deleteAccount: (userId) =>
    api.delete(`/users/${userId}`),
};

// PROFILE STATS
export const profileStatsService = {
  getStats: (userId) => api.get(`/profile-stats/${userId}`),
};

// SETTINGS
export const settingsService = {
  get: (userId) => api.get(`/settings/${userId}`),

  update: (userId, data) =>
    api.put(`/settings/${userId}`, {
      theme: data.theme || 'light',
      notifications_enabled:
        data.notifications_enabled !== undefined
          ? data.notifications_enabled
          : true,
      language: data.language || 'en',
      diet_preference: data.diet_preference || data.dietPreference || 'None',
      allergies: data.allergies || [],
      daily_calorie_goal: Number(data.daily_calorie_goal || 2000),
      daily_protein_goal: Number(data.daily_protein_goal || 60),
      daily_carbs_goal: Number(data.daily_carbs_goal || 250),
      daily_fat_goal: Number(data.daily_fat_goal || 70),
      health_goal: data.health_goal || null,
      cuisine_preferences: data.cuisine_preferences || [],
      disliked_foods: data.disliked_foods || [],
      cooking_time_preference: data.cooking_time_preference || null,
    }),

  updateLanguage: (userId, language) =>
    api.put(`/settings/${userId}`, {
      language: language || 'en',
    }),

  updateTheme: (userId, theme) =>
    api.put(`/settings/${userId}`, {
      theme: theme || 'light',
    }),

  updateNotifications: (userId, enabled) =>
    api.put(`/settings/${userId}`, {
      notifications_enabled: enabled,
    }),

  updateNutritionGoals: (userId, data) =>
    api.put(`/settings/${userId}`, {
      daily_calorie_goal: Number(data.daily_calorie_goal || 2000),
      daily_protein_goal: Number(data.daily_protein_goal || 60),
      daily_carbs_goal: Number(data.daily_carbs_goal || 250),
      daily_fat_goal: Number(data.daily_fat_goal || 70),
    }),

  updateCurrency: (userId, currency) =>
    api.put(`/settings/${userId}`, {
      currency: currency,
    }),

  updateMeasurementSystem: (userId, system) =>
    api.put(`/settings/${userId}`, {
      measurement_system: system,
    }),

  updateTimeFormat: (userId, format) =>
    api.put(`/settings/${userId}`, {
      time_format: format,
    }),

  updateOfflineMode: (userId, enabled) =>
    api.put(`/settings/${userId}`, {
      offline_mode: enabled,
    }),
};

// AI
export const aiService = {
  chat: (message, userId = 1) =>
    api.post('/ai/chat', {
      user_id: userId,
      message,
    }),

  generateRecipe: (userId, ingredients) =>
    api.post('/ai/generate-recipe', {
      user_id: userId,
      ingredients,
    }),
};

// AI RECIPE GENERATOR
export const aiRecipeService = {
  generate: (userId, prompt) =>
    api.post('/ai-recipe-generate', {
      user_id: userId,
      prompt,
    }),
};

// USER SERVICE
export const userService = {
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
};

// FAVORITES
export const favoritesService = {
  getFavorites: (userId) => api.get(`/recipes/favorites/${userId}`),
  addFavorite: (userId, data) => api.post(`/recipes/favorites/${userId}`, data),
  removeFavorite: (favoriteId) => api.delete(`/recipes/favorites/${favoriteId}`),
};

export default api;