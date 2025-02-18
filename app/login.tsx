import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import apiClient from '~/(utils)/api';

const loginSchema = yup.object().shape({
  secretKey: yup.string().required('Secret key is required'),
});

export default function LoginScreen() {
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginSchema.validate({ secretKey }, { abortEarly: false });
      setErrors({});

      const { data } = await apiClient.get('/warehousemans', {
        params: { secretKey },
      });

      if (!data || data.length === 0) {
        Alert.alert('User not found');
        return;
      }
      const user = data[0];
     
      if (user.secretKey !== secretKey) {
        Alert.alert('Invalid credentials');
        return;
      }

      await login(user);

      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errorMessages: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) errorMessages[error.path] = error.message;
        });
        setErrors(errorMessages);
      } else {
        Alert.alert('Error', 'Authentication failed. Please try again.');
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
          <Text className="mt-2 text-base text-gray-400">Welcome back, we missed you</Text>
        </View>

        <View className="space-y-4 px-6">
          <View className="space-y-2">
            <Text className="ml-1 py-2 text-sm text-gray-400">Secret Key</Text>
            <View className="flex-row items-center rounded-xl bg-gray-800 px-4 py-3">
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Enter secret key"
                placeholderTextColor="#666"
                secureTextEntry={!showSecretKey}
                value={secretKey}
                onChangeText={setSecretKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowSecretKey(!showSecretKey)}
                accessibilityLabel={showSecretKey ? 'Hide secret key' : 'Show secret key'}>
                <Text className="text-gray-400">{showSecretKey ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.secretKey && (
              <Text className="ml-1 text-sm text-red-500">{errors.secretKey}</Text>
            )}
          </View>

          <TouchableOpacity
            className="mt-4 items-center rounded-xl bg-yellow-700 py-4"
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button">
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-semibold text-white">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
