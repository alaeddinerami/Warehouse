import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


  
  export default apiClient;