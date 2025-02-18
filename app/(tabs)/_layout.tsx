import { Link, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <FontAwesome 
              name="cube" 
              size={24} 
              color={focused ? '#1a1a1a' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistics',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <FontAwesome 
              name="bar-chart" 
              size={24} 
              color={focused ? '#1a1a1a' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <FontAwesome 
              name="user" 
              size={24} 
              color={focused ? '#1a1a1a' : '#666'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}