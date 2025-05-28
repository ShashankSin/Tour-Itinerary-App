'use client'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react-native'

const { width } = Dimensions.get('window')

const CompanyLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoRotate = useRef(new Animated.Value(0)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setLoading(true)

    try {
      const response = await fetch(
        'http://10.0.2.2:5000/api/auth/company/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        await login(data.token, 'company', email)
        console.log('✅ Company Login successful')
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('Login Failed', 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  })

  const AnimatedInputField = ({
    icon: Icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
  }) => {
    const inputScale = useRef(new Animated.Value(1)).current

    const handleFocus = () => {
      Animated.spring(inputScale, {
        toValue: 1.02,
        useNativeDriver: true,
      }).start()
    }

    const handleBlur = () => {
      Animated.spring(inputScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View style={{ transform: [{ scale: inputScale }] }}>
        <View className="flex-row items-center bg-white/90 backdrop-blur-sm border border-orange-200 rounded-2xl px-4 py-4 shadow-lg">
          <Icon size={20} color="#ea580c" />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {placeholder === 'Enter your password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Animated Background */}
      <Animated.View
        className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600"
        style={{ opacity: fadeAnim }}
      />

      {/* Floating Elements */}
      <Animated.View
        className="absolute top-20 right-10 w-4 h-4 bg-white/30 rounded-full"
        style={{
          opacity: sparkleOpacity,
          transform: [{ scale: sparkleAnim }],
        }}
      />
      <Animated.View
        className="absolute top-40 left-8 w-6 h-6 bg-yellow-300/40 rounded-full"
        style={{
          opacity: sparkleOpacity,
          transform: [{ scale: sparkleAnim }],
        }}
      />
      <Animated.View
        className="absolute top-60 right-16 w-3 h-3 bg-white/40 rounded-full"
        style={{
          opacity: sparkleOpacity,
          transform: [{ scale: sparkleAnim }],
        }}
      />

      <StatusBar style="light" />

      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header with Animated Logo */}
        <View className="items-center pt-16 pb-8">
          <Animated.View
            className="relative mb-6"
            style={{
              transform: [
                { scale: logoScale },
                { rotate: logoRotateInterpolate },
              ],
            }}
          >
            <View className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl items-center justify-center shadow-2xl border border-white/30">
              <Building2 size={36} color="white" />
            </View>
            <Animated.View
              className="absolute -top-2 -right-2"
              style={{ opacity: sparkleOpacity }}
            >
              <Sparkles size={16} color="#fbbf24" />
            </Animated.View>
          </Animated.View>

          <Animated.Text
            className="text-4xl font-bold text-white mb-2"
            style={{ opacity: fadeAnim }}
          >
            Welcome Back
          </Animated.Text>
          <Animated.Text
            className="text-white/90 text-lg"
            style={{ opacity: fadeAnim }}
          >
            Sign in to your company account
          </Animated.Text>
        </View>

        {/* Login Form with Glass Effect */}
        <Animated.View
          className="flex-1 bg-white/95 backdrop-blur-xl rounded-t-[40px] px-6 pt-8 shadow-2xl"
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Company Login
            </Text>
            <Text className="text-gray-600 text-lg">
              Enter your credentials to continue
            </Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-gray-700 font-semibold mb-3 text-lg">
                Email Address
              </Text>
              <AnimatedInputField
                icon={Mail}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-3 text-lg">
                Password
              </Text>
              <AnimatedInputField
                icon={Lock}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end">
              <Text className="text-orange-600 font-semibold text-lg">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Animated Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                className={`bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl py-5 items-center shadow-xl ${
                  loading ? 'opacity-70' : ''
                }`}
                onPress={handleLogin}
                disabled={loading}
              >
                <View className="flex-row items-center">
                  {loading && (
                    <Animated.View
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      style={{
                        transform: [
                          {
                            rotate: logoRotate.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      }}
                    />
                  )}
                  <Text className="text-white text-xl font-bold">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <Text className="mx-4 text-gray-500 font-medium">or</Text>
              <View className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center pb-8">
              <Text className="text-gray-600 text-lg">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CompanySignup')}
              >
                <Text className="text-orange-600 font-bold text-lg">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

export default CompanyLoginScreen
