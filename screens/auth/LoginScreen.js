import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

function LoginScreen({ route, navigation, setUser }) {
  const { userType = 'user' } = route.params || {}

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://192.168.1.69:5000/api/auth/loginUser',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, userType }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        await AsyncStorage.setItem('token', data.token)
        await AsyncStorage.setItem('userType', userType)

        console.log('Login successful!')
        console.log('Token:', data.token)
        console.log('UserType:', userType)

        setUser({
          role: userType, // ✅ This fixes navigation condition
          email,
          token: data.token,
        })

        // Optional: Navigate directly after login
        // navigation.replace(userType === 'admin' ? 'AdminTabs' : userType === 'company' ? 'CompanyTabs' : 'UserTabs')
      } else {
        setError(data.message || 'Invalid credentials')
        Alert.alert('Login Failed', data.message || 'Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
      Alert.alert('Login Failed', 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/ebc_tk_adventure_2-1624450765.jpeg')}
            style={styles.logo}
          />
          <Text style={styles.title}>Tour Guide</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup', { userType })}
            >
              <Text
                style={{ color: '#f97316', marginTop: 4, fontWeight: '600' }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    marginTop: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
})

export default LoginScreen
