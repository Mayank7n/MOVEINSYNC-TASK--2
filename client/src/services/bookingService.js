import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
      }
      
      return Promise.reject({
        message: data?.message || 'An error occurred',
        status,
        data: data || {},
        isAxiosError: true
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        isNetworkError: true
      });
    } else {
      return Promise.reject({
        message: error.message || 'Request setup failed',
        isRequestError: true
      });
    }
  }
);

export const getMyBookings = async () => {
  try {
    console.log('Fetching bookings...');
    const response = await api.get('/bookings');
    console.log('Bookings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

export const bookEvent = async (eventId, bookingData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    console.log('Sending booking request for event:', eventId);
    console.log('Booking data:', bookingData);
    
    const response = await axios.post(
      `http://localhost:5000/api/v1/events/${eventId}/book`,
      {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        numberOfTickets: bookingData.numberOfTickets || 1
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Booking response:', response);
    
    if (response.data) {
      if (response.data.success === false) {
        return {
          success: false,
          message: response.data.message || 'Booking failed'
        };
      }
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking successful!'
      };
    }
    
    return {
      success: true,
      message: 'Booking successful!'
    };
    
  } catch (error) {
    console.error('Error booking event:', error);
    
    // If there's a response from the server
    if (error.response) {
      console.error('Error response:', error.response.data);
      // Extract the error message from the response
      const errorMessage = error.response.data.error || 
                         error.response.data.message || 
                         'Failed to book event';
      
      // If it's a cancelled booking error, show a specific message
      if (errorMessage.includes('CANCELLED_BOOKING:')) {
        throw new Error('You cannot book this event as you have already cancelled your previous booking.');
      }
      
      throw new Error(errorMessage);
    }
    
    // For other types of errors
    throw new Error(error.message || 'Failed to book event. Please try again.');
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the full response to handle both success and error cases
    return response.data;
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    
    // If there's a response from the server, throw it
    if (error.response) {
      throw error.response.data;
    }
    
    // For network errors, throw a generic error
    throw { 
      success: false, 
      message: 'Network error. Please check your connection and try again.' 
    };
  }
};

const bookingService = {
  getMyBookings,
  bookEvent,
  getBookingDetails,
  cancelBooking
};

export default bookingService;
