'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import TrekCard from '../../components/TrekCard'
import {
  Mountain,
  TrendingUp,
  MapPin,
  Compass,
  Sun,
  Star,
} from 'lucide-react-native'

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [trendingTreks, setTrendingTreks] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token || !user) {
        setLoading(false)
        return
      }

      // Fetch all treks for now - we'll filter them client-side
      const response = await axios.get(
        'http://192.168.1.69:5000/api/trek/allitinerary',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        const allTreks = response.data.treks || []

        // For now, just split the treks into different categories randomly
        const shuffled = [...allTreks].sort(() => 0.5 - Math.random())

        setRecommendations(shuffled.slice(0, 5))
        setTrendingTreks(shuffled.slice(5, 10))
        setPopularDestinations(shuffled.slice(10, 15))
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [
          {
            text: 'OK',
            onPress: () => logout(),
          },
        ])
      } else {
        Alert.alert('Error', 'Failed to load data. Please try again.')
      }
      setRecommendations([])
      setTrendingTreks([])
      setPopularDestinations([])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <ActivityIndicator size="large" color="#ea580c" />
            <Text className="text-gray-800 mt-4 font-semibold text-lg">
              Loading adventures...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center w-full">
            <Mountain size={64} color="#ea580c" />
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              Welcome to TrekApp
            </Text>
            <Text className="text-gray-600 text-center mt-2 text-lg">
              Please log in to discover amazing treks
            </Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-2xl px-8 py-4 mt-6 shadow-lg"
              onPress={() =>
                navigation.navigate('Auth', { screen: 'UserType' })
              }
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const renderTrekCard = ({ item: trek }) => {
    if (!trek || !trek._id) return null
    return (
      <TrekCard
        trek={trek}
        onPress={() =>
          navigation.navigate('ItineraryDetail', {
            itineraryId: trek._id,
          })
        }
      />
    )
  }

  const SectionHeader = ({ section, onSeeAll, icon: Icon }) => (
    <View className="flex-row items-center justify-between px-6 mb-4">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center mr-3 shadow-lg">
          <Icon size={22} color="white" />
        </View>
        <Text className="text-xl font-bold text-gray-800">{section}</Text>
      </View>
      <TouchableOpacity onPress={onSeeAll}>
        <Text className="text-orange-600 font-semibold text-lg">See All</Text>
      </TouchableOpacity>
    </View>
  )

  const renderSection = ({ section, data, onSeeAll, icon: Icon }) => (
    <View className="mb-8">
      <SectionHeader section={section} onSeeAll={onSeeAll} icon={Icon} />
      <FlatList
        data={data}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  )

  const sections = [
    {
      data: recommendations,
      title: 'Recommended for You',
      icon: Compass,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'recommended' }),
    },
    {
      data: trendingTreks,
      title: 'Trending Now',
      icon: TrendingUp,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'trending' }),
    },
    {
      data: popularDestinations,
      title: 'Popular Destinations',
      icon: MapPin,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'popular' }),
    },
  ].filter((section) => section.data && section.data.length > 0)

  const renderContent = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-orange-500 px-6 pt-16 pb-8 rounded-b-[40px] shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Sun size={24} color="white" />
              <Text className="text-white text-lg ml-2 font-medium">
                Good morning!
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mt-1">
              {user?.name || 'Traveler'}
            </Text>
            <Text className="text-white mt-2 text-lg">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <Mountain size={28} color="white" />
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mx-6 -mt-8 mb-6">
        <View className="flex-1 bg-white rounded-3xl p-5 mr-3 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-2">
            <Star size={20} color="#ea580c" />
            <Text className="text-gray-700 text-sm ml-2 font-medium">
              Completed
            </Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800">12</Text>
          <Text className="text-gray-600 text-sm">Treks</Text>
        </View>
        <View className="flex-1 bg-white rounded-3xl p-5 ml-3 shadow-lg border border-gray-100">
          <View className="flex-row items-center mb-2">
            <Mountain size={20} color="#f97316" />
            <Text className="text-gray-700 text-sm ml-2 font-medium">
              Rating
            </Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800">4.8</Text>
          <Text className="text-gray-600 text-sm">Average</Text>
        </View>
      </View>

      {/* Sections */}
      {sections.map((section) => (
        <View key={section.title}>
          {renderSection({
            section: section.title,
            data: section.data,
            onSeeAll: section.onSeeAll,
            icon: section.icon,
          })}
        </View>
      ))}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default HomeScreen
