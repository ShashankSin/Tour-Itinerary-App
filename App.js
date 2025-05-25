import { useState, useEffect } from 'react'
import './global.css'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View, Text, ActivityIndicator } from 'react-native'
import AppNavigator from './navigation/AppNavigator' // <-- Import the combined AppNavigator

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  const authState = {
    user: user || null, // Keep it null if no user
  }

  useEffect(() => {
    // Simulate loading or data fetching
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Uncomment to simulate a logged-in user
      // setUser({ type: 'user' });
      // setUser({ type: 'company' });
      // setUser({ type: 'admin' });
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        {/* Pass setUser to AppNavigator */}
        <AppNavigator authState={authState} setUser={setUser} />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
