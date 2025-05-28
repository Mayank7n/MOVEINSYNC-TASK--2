import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth';

export const login = async (email, password, role) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { email: email.trim(), password, role },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.token) {
      const token = response.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return response.data;
    }

    throw new Error('No token received');
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid email or password');
    }
    
    const errorMessage = error.response?.data?.message || 
                       'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};
