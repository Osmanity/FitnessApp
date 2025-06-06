import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text } from 'react-native';
import PlansScreen from '../screens/PlansScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import WorkoutTemplatesScreen from '../screens/WorkoutTemplatesScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import FoodScreen from '../screens/FoodScreen';
import SocialScreen from '../screens/SocialScreen';
import MenuScreen from '../screens/MenuScreen';
import AvatarScreen from '../screens/AvatarScreen';
import MealSelectionScreen from '../screens/MealSelectionScreen';
import WorkoutScreen from '../screens/WorkoutScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Plans Stack Navigator
const PlansStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlansMain" component={PlansScreen} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <Stack.Screen name="WorkoutTemplates" component={WorkoutTemplatesScreen} />
      <Stack.Screen name="MealSelection" component={MealSelectionScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
    </Stack.Navigator>
  );
};

// Custom Profile Tab Button
const CustomProfileButton = ({ onPress, focused }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        top: -10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      activeOpacity={0.8}
    >
      {/* Main button container */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: focused ? '#000' : '#f8f9fa',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: focused ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 6,
          borderWidth: 2,
          borderColor: focused ? '#333' : '#e9ecef',
        }}
      >
        {/* Avatar icon */}
        <MaterialCommunityIcons 
          name="account" 
          size={28} 
          color={focused ? '#fff' : '#333'} 
        />
      </View>
      
      {/* Label */}
      <Text
        style={{
          fontSize: 10,
          color: focused ? '#000' : '#666',
          marginTop: 4,
          fontWeight: focused ? '600' : '500',
        }}
      >
        Avatar
      </Text>
    </TouchableOpacity>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 15,
          paddingHorizontal: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: -5,
          marginBottom: 15,
        },
        tabBarIconStyle: {
          marginTop: -5,
        },
      }}
    >
      <Tab.Screen
        name="Plans"
        component={PlansStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Avatar"
        component={AvatarScreen}
        options={{
          tabBarIcon: () => null,
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <CustomProfileButton {...props} />
          ),
        }}
      />
      <Tab.Screen
        name="Food"
        component={FoodScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food-apple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator; 