'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function ExploreScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Recommendation states
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get userId from your authentication system
  const userId = route?.params?.userId // Replace with actual user ID from auth

  useEffect(() => {
    fetchRecommendations()
  }, [userId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await AsyncStorage.getItem('token')
      const decoded = jwtDecode(token)
      const userId = decoded.id

      const res = await fetch(
        `http://10.0.2.2:5000/api/recommendations?userId=${userId}&type=recommendations&limit=5`
      )
      const data = await res.json()

      if (data.success) {
        setRecommendations(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  const TrekCard = ({ trek, showSimilarity = false }) => (
    <TouchableOpacity
      className="mx-4 mb-4 bg-white rounded-xl overflow-hidden shadow"
      onPress={() => navigation.navigate('TrekDetail', { id: trek._id })}
    >
      <Image
        source={{
          uri:
            trek.images?.[0] ||
            `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop`,
        }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800">{trek.title}</Text>
        <View className="flex-row justify-between items-center mt-1">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">{trek.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#f97316" />
            <Text className="ml-1 text-gray-700">{trek.rating}</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-orange-600 font-semibold">₹{trek.price}</Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 capitalize">
              {trek.difficulty}
            </Text>
            <Text className="text-sm text-gray-400 ml-2">
              • {trek.duration} days
            </Text>
          </View>
        </View>
        {showSimilarity && trek.similarityScore && (
          <View className="mt-2 bg-orange-50 px-2 py-1 rounded">
            <Text className="text-xs text-orange-600">
              {Math.round(trek.similarityScore * 100)}% match for you
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const DestinationCard = ({ destination }) => (
    <TouchableOpacity
      className="mr-4 bg-white rounded-xl overflow-hidden shadow"
      style={{ width: 200 }}
      onPress={() =>
        navigation.navigate('LocationTreks', { location: destination.location })
      }
    >
      <Image
        source={{ uri: destination.image }}
        className="w-full h-24"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="font-bold text-gray-800">{destination.location}</Text>
        <View className="flex-row justify-between items-center mt-1">
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#f97316" />
            <Text className="ml-1 text-sm text-gray-600">
              {destination.avgRating}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {destination.trekCount} treks
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderRecommendations = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="mt-2 text-gray-600">Loading recommendations...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-red-500">{error}</Text>
          <TouchableOpacity
            onPress={fetchRecommendations}
            className="mt-2 bg-orange-500 px-4 py-2 rounded"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View>
        {/* Personalized Recommendations */}
        {userId && recommendations.length > 0 && (
          <View className="mt-4">
            <View className="px-4 flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800">
                Recommended for You
              </Text>
              <TouchableOpacity>
                <Text className="text-orange-500">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.map((trek) => (
                <View key={trek._id} style={{ width: 300 }}>
                  <TrekCard trek={trek} showSimilarity={true} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Destinations */}
        {popularDestinations.length > 0 && (
          <View className="mt-4">
            <View className="px-4 flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800">
                Popular Destinations
              </Text>
              <TouchableOpacity>
                <Text className="text-orange-500">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
            >
              {popularDestinations.map((destination, index) => (
                <DestinationCard key={index} destination={destination} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Experiences */}
        {trending.length > 0 && (
          <View className="mt-4 mb-6">
            <Text className="px-4 text-lg font-bold text-gray-800 mb-2">
              Trending Experiences
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
            >
              {trending.map((trek) => (
                <TouchableOpacity
                  key={trek._id}
                  className="mr-4 bg-white rounded-xl overflow-hidden shadow"
                  style={{ width: 200 }}
                  onPress={() =>
                    navigation.navigate('TrekDetail', { id: trek._id })
                  }
                >
                  <Image
                    source={{
                      uri:
                        trek.images?.[0] ||
                        `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop`,
                    }}
                    className="w-full h-24"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text className="font-bold text-gray-800">
                      {trek.title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      From ₹{trek.price}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="trending-up" size={12} color="#f97316" />
                      <Text className="text-xs text-orange-600 ml-1">
                        Trending
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    )
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 pt-6 pb-4 bg-orange-500">
        <Text className="text-2xl font-bold text-white mb-4">Explore</Text>

        <TouchableOpacity
          className="flex-row items-center bg-white rounded-full px-4 py-2"
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search destinations, treks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleSearch}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* AI-Powered Recommendations */}
        {renderRecommendations()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ExploreScreen
