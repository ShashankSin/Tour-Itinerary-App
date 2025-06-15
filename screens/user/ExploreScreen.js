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
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  Compass,
  X,
  Mountain,
} from 'lucide-react-native'

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

  const userId = route?.params?.userId

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
      className="mx-2 mb-4 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200"
      style={{ width: 300 }}
      onPress={() => navigation.navigate('TrekDetail', { id: trek._id })}
    >
      <View className="relative">
        <Image
          source={{
            uri:
              trek.images?.[0] ||
              `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop`,
          }}
          className="w-full h-52"
          resizeMode="cover"
        />

        <View className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-2">
          <View className="flex-row items-center">
            <Star size={14} color="#fbbf24" />
            <Text className="text-white text-sm ml-1 font-semibold">
              {trek.rating}
            </Text>
          </View>
        </View>

        {showSimilarity && trek.similarityScore && (
          <View className="absolute top-4 left-4 bg-orange-500 rounded-full px-3 py-2">
            <Text className="text-white text-sm font-bold">
              {Math.round(trek.similarityScore * 100)}% match
            </Text>
          </View>
        )}
      </View>

      <View className="p-5">
        <Text
          className="text-xl font-bold text-gray-800 mb-3"
          numberOfLines={1}
        >
          {trek.title}
        </Text>

        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#6b7280" />
          <Text
            className="ml-2 text-gray-600 text-base flex-1"
            numberOfLines={1}
          >
            {trek.location}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Clock size={16} color="#6b7280" />
            <Text className="ml-2 text-gray-600 text-base">
              {trek.duration} days
            </Text>
          </View>
          <View
            className={`px-3 py-2 rounded-full ${
              trek.difficulty === 'easy'
                ? 'bg-green-100'
                : trek.difficulty === 'moderate'
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                trek.difficulty === 'easy'
                  ? 'text-green-800'
                  : trek.difficulty === 'moderate'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}
            >
              {trek.difficulty}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-orange-600">
            ₹{trek.price}
          </Text>
          <TouchableOpacity className="bg-orange-500 rounded-2xl px-6 py-3 shadow-lg">
            <Text className="text-white text-base font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const DestinationCard = ({ destination }) => (
    <TouchableOpacity
      className="mr-4 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200"
      style={{ width: 220 }}
      onPress={() =>
        navigation.navigate('LocationTreks', { location: destination.location })
      }
    >
      <Image
        source={{ uri: destination.image }}
        className="w-full h-36"
        resizeMode="cover"
      />

      <View className="p-5">
        <Text className="font-bold text-gray-800 mb-3 text-lg">
          {destination.location}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Star size={16} color="#fbbf24" />
            <Text className="ml-2 text-base text-gray-600 font-medium">
              {destination.avgRating}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 font-medium">
            {destination.trekCount} treks
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const SearchBar = () => (
    <View className="px-6 py-4">
      <View className="flex-row items-center bg-white rounded-3xl px-6 py-4 shadow-lg border border-gray-200">
        <Search size={22} color="#ea580c" />
        <TextInput
          className="flex-1 ml-4 text-gray-800 text-lg"
          placeholder="Search destinations, treks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor="#9ca3af"
        />
        {isSearching ? (
          <ActivityIndicator size="small" color="#ea580c" />
        ) : searchQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('')
              setShowSearchResults(false)
            }}
          >
            <X size={22} color="#6b7280" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Filter size={22} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const SectionHeader = ({ title, icon: Icon, onSeeAll }) => (
    <View className="flex-row items-center justify-between px-6 mb-6">
      <View className="flex-row items-center">
        <View className="w-14 h-14 bg-orange-500 rounded-2xl items-center justify-center mr-4 shadow-lg">
          <Icon size={24} color="white" />
        </View>
        <Text className="text-2xl font-bold text-gray-800">{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-orange-600 font-bold text-lg">See All</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderSection = ({ title, data, renderItem, icon }) => (
    <View className="mb-10">
      <SectionHeader title={title} icon={icon} />
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
      title: 'Recommended for You',
      data: recommendations,
      renderItem: ({ item }) => <TrekCard trek={item} showSimilarity />,
      icon: Compass,
    },
    {
      title: 'Popular Destinations',
      data: popularDestinations,
      renderItem: ({ item }) => <DestinationCard destination={item} />,
      icon: MapPin,
    },
  ].filter((section) => section.data && section.data.length > 0)

  const renderContent = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-orange-500 px-6 pt-16 pb-8 rounded-b-[40px] shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-bold">Explore</Text>
            <Text className="text-white mt-2 text-lg">
              Discover amazing adventures
            </Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <Mountain size={28} color="white" />
          </View>
        </View>
      </View>

      <SearchBar />

      {showSearchResults ? (
        <View className="flex-1 px-6">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Search Results ({searchResults.length})
          </Text>
          <FlatList
            data={searchResults}
            renderItem={({ item }) => <TrekCard trek={item} />}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Search size={64} color="#d1d5db" />
                <Text className="text-center text-gray-500 mt-6 text-xl font-semibold">
                  No results found
                </Text>
                <Text className="text-center text-gray-400 mt-3 text-lg">
                  Try searching with different keywords
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        sections.map((section) => (
          <View key={section.title}>
            {renderSection({
              title: section.title,
              data: section.data,
              renderItem: section.renderItem,
              icon: section.icon,
            })}
          </View>
        ))
      )}
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl p-10 shadow-lg items-center">
            <ActivityIndicator size="large" color="#ea580c" />
            <Text className="text-gray-800 mt-6 font-semibold text-xl">
              Discovering adventures...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-10 shadow-lg items-center w-full">
            <Text className="text-red-500 text-xl font-bold mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-2xl px-8 py-4 shadow-lg"
              onPress={fetchRecommendations}
            >
              <Text className="text-white font-bold text-lg">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderContent}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default ExploreScreen
