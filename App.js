import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './navigation/AppNavigator'
import { AuthProvider } from './context/AuthContext'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import './global.css'

// Configure axios defaults
axios.defaults.baseURL = 'http://10.0.2.2:5000/api'
axios.defaults.timeout = 5000

// Add request interceptor to add auth token
axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        // Check token expiration
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decoded.exp && decoded.exp < currentTime) {
          // Token is expired, clear it
          await AsyncStorage.multiRemove(['token', 'userType'])
          throw new Error('Token expired')
        }

        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      await AsyncStorage.multiRemove(['token', 'userType'])
    }
    return Promise.reject(error)
  }
)

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}
