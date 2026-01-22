import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Shop" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏪</Text>,
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🛒</Text>,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#3b82f6' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Product" 
              component={ProductScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen 
              name="Checkout" 
              component={CheckoutScreen}
              options={{ title: 'Checkout' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
