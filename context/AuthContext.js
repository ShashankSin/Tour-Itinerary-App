import React, { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const userType = await AsyncStorage.getItem('userType')

      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          // Check if token is expired
          if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired')
            await logout()
            return
          }

          // Set axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          setUser({
            role: userType,
            email: decoded.email,
            token,
            id: decoded.id,
          })
        } catch (decodeError) {
          console.error('Token decode error:', decodeError)
          await logout()
        }
      }
    } catch (error) {
      console.error('Auth state check error:', error)
      await logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (token, userType, email) => {
    try {
      // First clear any existing auth data
      await AsyncStorage.multiRemove(['token', 'userType'])

      // Validate token before storing
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000

      if (decoded.exp && decoded.exp < currentTime) {
        throw new Error('Token is already expired')
      }

      // Store new auth data
      await AsyncStorage.setItem('token', token)
      await AsyncStorage.setItem('userType', userType)

      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser({
        role: userType,
        email,
        token,
        id: decoded.id,
      })
    } catch (error) {
      console.error('Login error:', error)
      await logout()
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear all auth-related data
      await AsyncStorage.multiRemove(['token', 'userType'])

      // Clear axios headers
      delete axios.defaults.headers.common['Authorization']

      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthState,
  }

  if (loading) {
    return null // Or a loading spinner component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
