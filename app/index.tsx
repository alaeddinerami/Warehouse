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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
    username: yup.string().trim()
    .required("Full Name is required.")
    .matches(/^[A-Za-z\s]+$/, "Full Name cannot contain numbers or special characters.")
    .min(2, "Full Name must be at least 2 characters")
    .max(50, "Full Name cannot exceed 50 characters"),
    secretKey: yup
      .string()
      .required('secretKey is required')
     
  });

interface SocialButtonProps {
  icon: any;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, onPress }) => (
  <TouchableOpacity 
    className="w-12 h-12 rounded-full bg-gray-800 justify-center items-center mx-2"
    onPress={onPress}
  >
    <Image source={icon} className="w-6 h-6" />
  </TouchableOpacity>
);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [secretKey, setsecretKey] = useState('');
  const [showsecretKey, setShowsecretKey] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogin = async () => {
    try {
      await loginSchema.validate({ username, secretKey }, { abortEarly: false });
      
      setErrors({});
      console.log('Login with:', username, secretKey);
      
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errorMessages: { [key: string]: string } = {};
        err.inner.forEach(error => {
          if (error.path) {
            errorMessages[error.path] = error.message;
          }
        });
        setErrors(errorMessages);
      }
    }
  };

  return (
    <SafeAreaView className="flex h-full justify-center pb-10 bg-[#1a1a1a]">
      <StatusBar style="light" />

      <View className="flex">
        <View className="items-center mb-8 px-6">
          <Image
            source={require('../assets/logo.png')}
            className="w-60 h-60"
            resizeMode="contain"
          />
          <Text className="text-white text-3xl font-bold mt-4">Welcome Back!</Text>
          <Text className="text-gray-400 text-base mt-2">welcome back we missed you</Text>
        </View>

        <View className="px-6 space-y-4">
          <View className="space-y-2">
            <Text className="text-gray-400 text-sm py-2 ml-1">Username</Text>
            <View className="bg-gray-800 rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="Enter username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            {errors.username && (
              <Text className="text-red-500 text-sm ml-1">{errors.username}</Text>
            )}
          </View>

          <View className="space-y-2">
            <Text className="text-gray-400 text-sm py-2 ml-1">secretKey</Text>
            <View className="bg-gray-800 rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="Enter secretKey"
                placeholderTextColor="#666"
                secureTextEntry={!showsecretKey}
                value={secretKey}
                onChangeText={setsecretKey}
              />
              <TouchableOpacity onPress={() => setShowsecretKey(!showsecretKey)}>
                <Text className="text-gray-400">
                  {showsecretKey ? '👁️' : '🙈'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.secretKey && (
              <Text className="text-red-500 text-sm ml-1">{errors.secretKey}</Text>
            )}
          </View>

          <TouchableOpacity
            className="bg-yellow-700 rounded-xl py-4 items-center mt-4"
            onPress={handleLogin}
          >
            <Text className="text-white text-base font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}