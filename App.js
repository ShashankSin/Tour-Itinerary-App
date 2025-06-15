import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './navigation/AppNavigator'
import { AuthProvider } from './context/AuthContext'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { CommonActions } from '@react-navigation/native'
import './global.css'

// Create navigation ref
export const navigationRef = React.createRef()

// Helper function to handle token expiration
const handleTokenExpiration = async () => {
  await AsyncStorage.removeItem('token')
  if (navigationRef.current) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'UserType' } }],
      })
    )
  }
}

// Configure axios defaults
axios.defaults.baseURL = 'http://192.168.1.69:5000/api'
axios.defaults.timeout = 10000 // 10 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json'

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
          // Token is expired, clear it and redirect
          await handleTokenExpiration()
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
    if (!error.response) {
      // Network error
      console.error('Network Error:', error)
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection.')
      }
      throw new Error('Network error. Please check your connection.')
    }

    if (error.response?.status === 401) {
      // Clear auth data on unauthorized and redirect
      await handleTokenExpiration()
    }

    return Promise.reject(error)
  }
)

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}
