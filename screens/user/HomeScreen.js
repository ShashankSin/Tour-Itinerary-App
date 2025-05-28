'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import {
  getRecommendedTreks,
  getTrendingTreks,
  getPopularDestinations,
} from '../../services/recommendationService'
import TrekCard from '../../components/TrekCard'
import { Mountain, TrendingUp, MapPin, Compass } from 'lucide-react-native'

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [trendingTreks, setTrendingTreks] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])

  const fetchData = async () => {
    if (!user || !user.token) {
      setLoading(false)
      return
    }

    try {
      const [recommendedData, trendingData, popularData] = await Promise.all([
        getRecommendedTreks(user.id, user.token),
        getTrendingTreks(user.token),
        getPopularDestinations(user.token),
      ])

      setRecommendations(recommendedData || [])
      setTrendingTreks(trendingData || [])
      setPopularDestinations(popularData || [])
    } catch (error) {
      console.error('Error fetching home data:', error)
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
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-orange-50 to-red-50">
        <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-gray-600 mt-4 font-medium">
            Loading adventures...
          </Text>
        </View>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-orange-50 to-red-50">
        <View className="bg-white rounded-2xl p-8 shadow-lg items-center mx-6">
          <Mountain size={48} color="#ea580c" />
          <Text className="text-xl font-bold text-gray-800 mt-4">
            Welcome to TrekApp
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please log in to discover amazing treks
          </Text>
          <TouchableOpacity className="bg-orange-500 rounded-xl px-6 py-3 mt-6">
            <Text className="text-white font-semibold">Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  const renderSection = ({ section, data, onSeeAll, icon: Icon }) => (
    <View className="mb-8">
      <View className="flex-row items-center justify-between px-6 mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
            <Icon size={20} color="#ea580c" />
          </View>
          <Text className="text-xl font-bold text-gray-800">{section}</Text>
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-orange-600 font-medium">See All</Text>
        </TouchableOpacity>
      </View>
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
      <View className="bg-gradient-to-r from-orange-500 to-red-600 px-6 pt-12 pb-8 rounded-b-3xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg opacity-90">Good morning!</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {user?.name || 'Traveler'}
            </Text>
            <Text className="text-white opacity-90 mt-2">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Mountain size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mx-6 -mt-6 mb-6">
        <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">12</Text>
          <Text className="text-gray-600 text-sm">Treks Completed</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">4.8</Text>
          <Text className="text-gray-600 text-sm">Average Rating</Text>
        </View>
      </View>

      {/* Sections */}
      {sections.map((section, index) => (
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
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default HomeScreen
