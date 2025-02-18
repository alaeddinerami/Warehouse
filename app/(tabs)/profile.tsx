import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '~/context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Could not complete logout. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-sm flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-800">Profile</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="p-2 bg-red-100 rounded-full"
          accessibilityLabel="Logout"
        >
          <LogOut size={24} color="#e53e3e" />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          {/* User Avatar Section */}
          <View className="items-center mb-6">
            <View className="bg-gray-200 rounded-full w-24 h-24 mb-4 items-center justify-center">
              <Text className="text-2xl font-bold text-gray-600">
                {user?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">
              {user?.name || 'No Name'}
            </Text>
            {user?.city && (
              <Text className="text-gray-600 mt-1">{user.city}</Text>
            )}
          </View>

          {/* User Details Section */}
          {user && (
            <View className="mb-6">
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">Date of Birth</Text>
                <Text className="text-base text-gray-800">
                  {user.dob || 'Not specified'}
                </Text>
              </View>
              
              <View className="mb-4">
                <Text className="text-sm text-gray-500 mb-1">User ID</Text>
                <Text className="text-base text-gray-800">{user.id}</Text>
              </View>

              {user.secretKey && (
                <View>
                  <Text className="text-sm text-gray-500 mb-1">Secret Key</Text>
                  <Text className="text-base text-gray-800">••••••••</Text>
                </View>
              )}
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-3 rounded-xl flex-row justify-center items-center mt-4"
            accessibilityRole="button"
          >
            <LogOut size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold">Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});