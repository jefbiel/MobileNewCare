import React from 'react';
import { Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../styles/theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HabitoScreen';
import InicioScreen from '../screens/InicioScreen';
import SettingsScreen from '../screens/AjustesScreen';

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Image source={require('../assets/images/home.png')} style={{ width: size, height: size, tintColor: color }} />
);

const HabitsIcon = ({ color, size }: { color: string; size: number }) => (
  <Image source={require('../assets/images/habits.png')} style={{ width: size, height: size, tintColor: color }} />
);

const SettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Image source={require('../assets/images/setting.png')} style={{ width: size, height: size, tintColor: color }} />
);

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="InicioScreen" component={InicioScreen} options={{ tabBarIcon: HomeIcon, tabBarLabel: 'Início' }} />
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: HabitsIcon, tabBarLabel: 'Hábitos' }} />
      <Tabs.Screen name="Ajustes" component={SettingsScreen} options={{ tabBarIcon: SettingsIcon, tabBarLabel: 'Ajustes' }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
