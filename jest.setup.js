import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '~/(utils)/api'; 

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));


jest.mock('~/(utils)/api', () => ({
  post: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
}));