import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SignupScreen({ route, navigation }) {
  const [userType, setUserType] = useState('') // default fallback

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Read userType from route.params and save to state
    if (route?.params?.userType) {
      setUserType(route.params.userType)
      AsyncStorage.setItem('userType', route.params.userType)
        .then(() => console.log('Stored userType:', route.params.userType))
        .catch((err) => console.error('Failed to store userType:', err))
    }
  }, [route?.params?.userType])

  const handleSignup = async () => {
    console.log(userType)
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://192.168.1.69:5000/api/auth/registerUser',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, userType }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        Alert.alert(
          'Signup Success',
          'Check your email for a verification OTP.'
        )

        navigation.navigate('VerifyOtp', {
          userId: data.userId,
          email,
          userType,
        })
      } else {
        setError(data.message || 'Failed to register')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      if (error) Alert.alert('Signup Failed', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/ebc_tk_adventure_2-1624450765.jpeg')}
              style={styles.logo}
            />
            <Text style={styles.title}>
              {userType === 'company'
                ? 'Register Your Company'
                : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {userType === 'company'
                ? 'Sign up to start offering trekking experiences'
                : 'Sign up to discover amazing treks'}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder={
                userType === 'company' ? 'Company Name' : 'Full Name'
              }
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login', { userType })}
              >
                <Text
                  style={{ color: '#f97316', marginTop: 4, fontWeight: '600' }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
