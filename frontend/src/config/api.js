const API_CONFIG = {
  auth: process.env.REACT_APP_AUTH_API_URL || 'http://localhost:4001/api',
  event: process.env.REACT_APP_EVENT_API_URL || 'http://localhost:4002/api',
  booking: process.env.REACT_APP_BOOKING_API_URL || 'http://localhost:4003/api'
};

export default API_CONFIG;
