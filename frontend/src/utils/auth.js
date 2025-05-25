// Authentication utility functions

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const setAuthData = (userData, accessToken, refreshToken) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const logout = () => {
  clearAuthData();
  // Redirect to login page
  window.location.href = '/login';
};

// Token validation (basic check - you might want to decode JWT for expiry)
export const isTokenValid = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    // Basic check - in production you'd want to decode JWT and check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Auth context helper
export const useAuthStatus = () => {
  return {
    isAuthenticated: isAuthenticated(),
    user: getUser(),
    token: getAccessToken(),
  };
};