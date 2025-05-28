'use client'

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../context/AuthContext'
import { CommonActions } from '@react-navigation/native'
import {
  Calendar,
  MapPin,
  Settings,
  Edit3,
  LogOut,
  LogIn,
  Shield,
  Award,
  Camera,
} from 'lucide-react-native'

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: '',
    tripsCompleted: 0,
  })

  const { logout } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
          return
        }

        const decoded = jwtDecode(token)
        console.log('🔐 Decoded Token:', decoded)

        const response = await fetch('http://10.0.2.2:5000/api/user/userData', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        console.log('📥 User Data:', userData)

        if (userData.success && userData.usersData) {
          setUser((prevUser) => ({
            ...prevUser,
            id: decoded.id || '',
            name: userData.usersData.name || '',
            email: userData.usersData.email || '',
            avatar: userData.usersData.avatar || prevUser.avatar,
            memberSince: userData.usersData.createdAt
              ? new Date(userData.usersData.createdAt).toLocaleString(
                  'default',
                  {
                    month: 'long',
                    year: 'numeric',
                  }
                )
              : '',
            tripsCompleted: userData.usersData.tripsCompleted || 0,
          }))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        Alert.alert('Error', 'Failed to load profile data')
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'UserType' }],
        })
      )
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const MenuButton = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    color = '#6B7280',
    bgColor = 'bg-white',
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgColor} rounded-2xl p-4 mb-3 shadow-sm border border-gray-100`}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
          <Icon size={24} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
          {subtitle && (
            <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
        <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
          <Text className="text-gray-400 text-xs">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 to-red-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-r from-orange-600 to-red-600 px-6 pt-8 pb-12 rounded-b-3xl">
          <View className="items-center">
            <View className="relative">
              <Image
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full items-center justify-center shadow-md">
                <Camera size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-bold text-white mt-4">
              {user.name || 'Guest User'}
            </Text>
            <Text className="text-white opacity-90 mt-1">
              {user.email || 'guest@example.com'}
            </Text>

            {/* Achievement Badge */}
            <View className="bg-white/20 rounded-full px-4 py-2 mt-3">
              <Text className="text-white text-sm font-medium">
                Adventure Explorer
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Stats Cards */}
          <View className="flex-row mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
              <View className="flex-row items-center mb-2">
                <MapPin size={20} color="#ea580c" />
                <Text className="text-gray-600 text-sm ml-2">Trips</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {user.tripsCompleted}
              </Text>
              <Text className="text-gray-500 text-xs">Completed</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#f97316" />
                <Text className="text-gray-600 text-sm ml-2">Member</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800">
                {user.memberSince || 'New'}
              </Text>
              <Text className="text-gray-500 text-xs">Since</Text>
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Account
            </Text>

            <MenuButton
              icon={Edit3}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('EditProfile')}
              color="#f97316"
            />

            <MenuButton
              icon={Settings}
              title="Settings"
              subtitle="Preferences and privacy"
              onPress={() => navigation.navigate('Settings')}
              color="#6b7280"
            />

            <MenuButton
              icon={Shield}
              title="Privacy & Security"
              subtitle="Manage your account security"
              onPress={() => navigation.navigate('Privacy')}
              color="#ea580c"
            />

            <MenuButton
              icon={Award}
              title="Achievements"
              subtitle="View your trekking milestones"
              onPress={() => navigation.navigate('Achievements')}
              color="#f59e0b"
            />
          </View>

          {/* Action Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Actions
            </Text>

            {user.id ? (
              <MenuButton
                icon={LogOut}
                title="Sign Out"
                subtitle="Log out of your account"
                onPress={handleLogout}
                color="#ef4444"
                bgColor="bg-red-50"
              />
            ) : (
              <MenuButton
                icon={LogIn}
                title="Sign In"
                subtitle="Access your account"
                onPress={() => navigation.navigate('Login')}
                color="#ea580c"
                bgColor="bg-orange-50"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
