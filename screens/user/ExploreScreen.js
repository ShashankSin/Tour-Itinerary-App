import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

function ExploreScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: '1', name: 'Mountains', icon: 'triangle-outline' },
    { id: '2', name: 'Beaches', icon: 'water-outline' },
    { id: '3', name: 'Cities', icon: 'business-outline' },
    { id: '4', name: 'Hiking', icon: 'footsteps-outline' },
    { id: '5', name: 'Cultural', icon: 'color-palette-outline' },
  ]

  const destinations = [
    {
      id: '1',
      name: 'Annapurna Circuit',
      location: 'Nepal',
      rating: 4.8,
      image:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: '2',
      name: 'Bali Beaches',
      location: 'Indonesia',
      rating: 4.7,
      image:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: '3',
      name: 'Tokyo City Tour',
      location: 'Japan',
      rating: 4.9,
      image:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 pt-6 pb-4 bg-orange-500">
        <Text className="text-2xl font-bold text-white mb-4">Explore</Text>

        <View className="flex-row items-center bg-white rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search destinations"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Categories */}
        <View className="mt-4">
          <Text className="px-4 text-lg font-bold text-gray-800 mb-2">
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            {categories.map((category) => (
              <TouchableOpacity key={category.id} className="mr-4 items-center">
                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-1">
                  <Ionicons name={category.icon} size={24} color="#f97316" />
                </View>
                <Text className="text-gray-700 text-sm">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Destinations */}
        <View className="mt-6">
          <View className="px-4 flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-800">
              Popular Destinations
            </Text>
            <TouchableOpacity>
              <Text className="text-orange-500">See All</Text>
            </TouchableOpacity>
          </View>

          {destinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              className="mx-4 mb-4 bg-white rounded-xl overflow-hidden shadow"
              onPress={() =>
                navigation.navigate('DestinationDetail', { id: destination.id })
              }
            >
              <Image
                source={{ uri: destination.image }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="text-lg font-bold text-gray-800">
                  {destination.name}
                </Text>
                <View className="flex-row justify-between items-center mt-1">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#9ca3af"
                    />
                    <Text className="ml-1 text-gray-500">
                      {destination.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#f97316" />
                    <Text className="ml-1 text-gray-700">
                      {destination.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Experiences */}
        <View className="mt-2 mb-6">
          <Text className="px-4 text-lg font-bold text-gray-800 mb-2">
            Trending Experiences
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            {[1, 2, 3].map((item) => (
              <TouchableOpacity
                key={item}
                className="mr-4 bg-white rounded-xl overflow-hidden shadow"
                style={{ width: 200 }}
              >
                <Image
                  source={{
                    uri: `https://source.unsplash.com/random/200x150?travel=${item}`,
                  }}
                  className="w-full h-24"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text className="font-bold text-gray-800">
                    Adventure Trek
                  </Text>
                  <Text className="text-sm text-gray-500">From ₹1,200</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ExploreScreen
