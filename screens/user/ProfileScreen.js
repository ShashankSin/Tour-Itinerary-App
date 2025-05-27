import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import jwtDecode from 'jwt-decode'

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: '',
    tripsCompleted: 0,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        if (!token) {
          Alert.alert('Error', 'User not authenticated')
          navigation.replace('Login') // Redirect if no token
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

        setUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          avatar:
            userData.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          memberSince: new Date(userData.createdAt).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          }),
          tripsCompleted: userData.tripsCompleted || 0,
        })
      } catch (err) {
        console.error('❌ Error fetching user data:', err)
        Alert.alert('Error', 'Could not load user profile')
      }
    }

    fetchUserData()
  }, [])

  const menuItems = [
    {
      id: '1',
      title: 'Personal Information',
      icon: 'person-outline',
      screen: 'PersonalInfo',
    },
    {
      id: '2',
      title: 'My Bookings',
      icon: 'calendar-outline',
      screen: 'Bookings',
    },
    {
      id: '3',
      title: 'Payment Methods',
      icon: 'card-outline',
      screen: 'Payment',
    },
    {
      id: '4',
      title: 'Notifications',
      icon: 'notifications-outline',
      screen: 'Notifications',
    },
    {
      id: '5',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      screen: 'Support',
    },
    {
      id: '6',
      title: 'About Us',
      icon: 'information-circle-outline',
      screen: 'About',
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* User Profile Card */}
        <View className="m-4 bg-white rounded-xl shadow overflow-hidden">
          <View className="bg-orange-100 p-4">
            <View className="flex-row items-center">
              <Image
                source={{ uri: user.avatar }}
                className="w-20 h-20 rounded-full border-2 border-white"
              />
              <View className="ml-4">
                <Text className="text-xl font-bold text-gray-800">
                  {user.name}
                </Text>
                <Text className="text-gray-600">{user.email}</Text>
              </View>
            </View>
          </View>

          <View className="p-4 flex-row justify-between">
            <View className="items-center">
              <Text className="text-gray-500">Member Since</Text>
              <Text className="font-semibold text-gray-800">
                {user.memberSince}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500">Trips Completed</Text>
              <Text className="font-semibold text-gray-800">
                {user.tripsCompleted}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="bg-orange-500 mx-4 mb-4 py-2 rounded-lg items-center">
            <Text className="text-white font-medium">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View className="mx-4 bg-white rounded-xl shadow overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center p-4 ${
                index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onPress={() => {
                if (item.screen === 'Bookings') {
                  console.log(
                    '📦 Navigating to Bookings with user ID:',
                    user.id
                  )
                  navigation.navigate('Bookings', { userId: user.id })
                } else {
                  navigation.navigate(item.screen)
                }
              }}
            >
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                <Ionicons name={item.icon} size={18} color="#f97316" />
              </View>
              <Text className="ml-3 flex-1 text-gray-800">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            marginHorizontal: 16,
            marginBottom: 32,
            padding: 16,
            backgroundColor: '#fff',
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('token')

              // Call backend logout API
              await fetch('http://10.0.2.2:5000/api/auth/logoutUser', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })

              // Remove token
              await AsyncStorage.removeItem('token')

              // Set user to null and navigate to Login screen
              setUser(null)
              navigation.replace('Login')
            } catch (error) {
              console.error('Logout error:', error)
              Alert.alert(
                'Logout Failed',
                'Something went wrong. Please try again.'
              )
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{ marginLeft: 8, color: '#ef4444', fontWeight: '500' }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
