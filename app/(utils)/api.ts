import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
apiClient.interceptors.response.use(
    (response) => response.data, 
    (error) => {
     
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Unauthorized access');
            break;
          case 404:
            console.error('API endpoint not found');
            break;
          case 500:
            console.error('Server error');
            break;
        }
      }
      return Promise.reject(error);
    }
  );
  
  export default apiClient;