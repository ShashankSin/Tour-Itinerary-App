'use client'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import axios from 'axios'
import {
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  User,
  Eye,
  EyeOff,
} from 'lucide-react-native'

const CompanySignupScreen = ({ navigation }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(
        'http://10.0.2.2:5000/api/auth/company/register',
        {
          name,
          email,
          password,
          phone,
          website,
        }
      )

      console.log('Signup response:', response.data)

      const userId =
        response.data.userId || response.data.user?._id || response.data._id

      const companyId = response.data.companyId || response.data._id

      navigation.navigate('VerifyOtp', {
        userId,
        email,
        userType: 'company',
        companyId,
      })
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({
    icon: Icon,
    label,
    placeholder,
    value,
    onChangeText,
    ...props
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:border-orange-500">
        <Icon size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-gray-800 text-base"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {label === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 to-red-100">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="items-center pt-8 pb-6">
        <View className="w-20 h-20 bg-orange-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
          <Building2 size={32} color="white" />
        </View>
        <Text className="text-3xl font-bold text-gray-800">Join Us</Text>
        <Text className="text-gray-600 mt-2">Create your company account</Text>
      </View>

      {/* Signup Form */}
      <View className="flex-1 bg-white rounded-t-3xl">
        <ScrollView className="px-6 pt-8" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Company Registration
            </Text>
            <Text className="text-gray-600">Fill in your company details</Text>
          </View>

          <InputField
            icon={User}
            label="Company Name *"
            placeholder="Enter company name"
            value={name}
            onChangeText={setName}
          />

          <InputField
            icon={Mail}
            label="Email Address *"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            icon={Lock}
            label="Password *"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <InputField
            icon={Phone}
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <InputField
            icon={Globe}
            label="Website"
            placeholder="Enter website URL"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Terms and Conditions */}
          <View className="bg-orange-50 rounded-xl p-4 mb-6">
            <Text className="text-sm text-gray-600 text-center">
              By creating an account, you agree to our{' '}
              <Text className="text-orange-600 font-medium">
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text className="text-orange-600 font-medium">
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            className={`bg-orange-600 rounded-xl py-4 items-center shadow-lg mb-6 ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center pb-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompanyLogin')}
            >
              <Text className="text-orange-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default CompanySignupScreen
