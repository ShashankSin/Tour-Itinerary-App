'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function ExploreScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const token = await AsyncStorage.getItem('token')

      const response = await axios.get(
        `http://10.0.2.2:5000/api/trek/search?query=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        setSearchResults(response.data.data)
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
      Alert.alert('Error', 'Failed to search treks')
    } finally {
      setIsSearching(false)
    }
  }

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

  const SearchBar = () => (
    <View className="px-4 py-2">
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-2 text-gray-800"
          placeholder="Search destinations, treks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('')
              setShowSearchResults(false)
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const renderSection = ({ title, data, renderItem }) => (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-800 px-4 mb-2">{title}</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  )

  const sections = [
    {
      title: 'Recommended Treks',
      data: recommendations,
      renderItem: ({ item }) => <TrekCard trek={item} showSimilarity />,
    },
    {
      title: 'Popular Destinations',
      data: popularDestinations,
      renderItem: ({ item }) => <DestinationCard destination={item} />,
    },
  ].filter((section) => section.data && section.data.length > 0)

  const renderContent = () => (
    <>
      <SearchBar />
      {showSearchResults ? (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <TrekCard trek={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">No results found</Text>
          }
        />
      ) : (
        sections.map((section) => (
          <View key={section.title}>
            {renderSection({
              title: section.title,
              data: section.data,
              renderItem: section.renderItem,
            })}
          </View>
        ))
      )}
    </>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderContent}
        keyExtractor={(item) => item.key}
      />
    </SafeAreaView>
  )
}

export default ExploreScreen
