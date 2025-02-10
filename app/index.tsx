import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import apiClient from './(utils)/api';
import { router } from 'expo-router';

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required('Full Name is required.')
    .matches(/^[A-Za-z\s]+$/, 'Full Name cannot contain numbers or special characters.')
    .min(2, 'Full Name must be at least 2 characters')
    .max(50, 'Full Name cannot exceed 50 characters'),
  secretKey: yup.string().required('secretKey is required'),
});

interface SocialButtonProps {
  icon: any;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, onPress }) => (
  <TouchableOpacity
    className="mx-2 h-12 w-12 items-center justify-center rounded-full bg-gray-800"
    onPress={onPress}>
    <Image source={icon} className="h-6 w-6" />
  </TouchableOpacity>
);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [secretKey, setsecretKey] = useState('');
  const [showsecretKey, setShowsecretKey] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      await loginSchema.validate({ username, secretKey }, { abortEarly: false });
      setErrors({});
      setLoading(true);

      const { data } = await apiClient.get('/warehousemans', {
        params: {
          name: username,
          secretKey: secretKey,
        },
      });
      
      const user = data[0];
      router.push('/(tabs)')
    } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errorMessages: { [key: string]: string } = {};
          err.inner.forEach(error => {
            if (error.path) errorMessages[error.path] = error.message;
          });
          setErrors(errorMessages);
        } else {
          Alert.alert('Authentication failed');
        }
      } finally {
        setLoading(false);
      }
  };

  return (
    <SafeAreaView className="flex h-full justify-center bg-[#1a1a1a] pb-10">
      <StatusBar style="light" />

      <View className="flex">
        <View className="mb-8 items-center px-6">
          <Image
            source={require('../assets/logo.png')}
            className="h-60 w-60"
            resizeMode="contain"
          />
          <Text className="mt-4 text-3xl font-bold text-white">Welcome Back!</Text>
          <Text className="mt-2 text-base text-gray-400">welcome back we missed you</Text>
        </View>

        <View className="space-y-4 px-6">
          <View className="space-y-2">
            <Text className="ml-1 py-2 text-sm text-gray-400">Username</Text>
            <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Enter username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            {errors.username && (
              <Text className="ml-1 text-sm text-red-500">{errors.username}</Text>
            )}
          </View>

          <View className="space-y-2">
            <Text className="ml-1 py-2 text-sm text-gray-400">secretKey</Text>
            <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Enter secretKey"
                placeholderTextColor="#666"
                secureTextEntry={!showsecretKey}
                value={secretKey}
                onChangeText={setsecretKey}
              />
              <TouchableOpacity onPress={() => setShowsecretKey(!showsecretKey)}>
                <Text className="text-gray-400">{showsecretKey ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.secretKey && (
              <Text className="ml-1 text-sm text-red-500">{errors.secretKey}</Text>
            )}
          </View>

          <TouchableOpacity
            className="mt-4 items-center rounded-xl bg-yellow-700 py-4"
            onPress={handleLogin}
            disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-semibold">Sign in</Text>
                )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
