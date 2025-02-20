import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup';
import apiClient from '../../utils/api';

export const loginSchema = yup.object().shape({
  secretKey: yup.string().required('secretKey is required'),
});

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
}

export class AuthService {
   async isAuthenticated(): Promise<boolean> {
    try {
      const user = await AsyncStorage.getItem('user');
      return !!user;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }
   async login(secretKey: string): Promise<AuthResponse> {
    try {
      await loginSchema.validate({ secretKey }, { abortEarly: false });

      const { data } = await apiClient.get('/warehousemans', {
        params: { secretKey },
      });

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const user = data[0];

      if (user.secretKey !== secretKey) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }
      const userAuth = JSON.stringify(user);
      await AsyncStorage.setItem('user', userAuth);

      return {
        success: true,
        user,
      };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw error;
      }
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('secretKey');
  }

  static async getStoredSecretKey(): Promise<string | null> {
    return await AsyncStorage.getItem('secretKey');
  }
}
