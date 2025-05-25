import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

function WishlistScreen({ navigation }) {
  const wishlistItems = [
    {
      id: '1',
      name: 'Everest Base Camp Trek',
      location: 'Nepal',
      image:
        'https://images.unsplash.com/photo-1533130061792-64b345e4a833?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      price: '₹45,000',
      saved: true,
    },
    {
      id: '2',
      name: 'Bali Beach Resort',
      location: 'Indonesia',
      image:
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      price: '₹32,000',
      saved: true,
    },
    {
      id: '3',
      name: 'Kyoto Cultural Tour',
      location: 'Japan',
      image:
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      price: '₹28,500',
      saved: true,
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <Text className="text-2xl font-bold text-white">Wishlist</Text>
        <Text className="text-white opacity-80">Your saved destinations</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {wishlistItems.length > 0 ? (
          wishlistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl overflow-hidden mb-4 shadow"
              onPress={() =>
                navigation.navigate('ItineraryDetail', { itineraryId: item.id })
              }
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2">
                <TouchableOpacity className="bg-white rounded-full p-2">
                  <Ionicons name="heart" size={24} color="#f97316" />
                </TouchableOpacity>
              </View>
              <View className="p-4">
                <Text className="text-lg font-bold text-gray-800">
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <Text className="ml-1 text-gray-500">{item.location}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-orange-500 font-bold">
                    {item.price}
                  </Text>
                  <TouchableOpacity className="bg-orange-500 px-4 py-2 rounded-lg">
                    <Text className="text-white font-medium">Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="heart-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg mt-4">
              Your wishlist is empty
            </Text>
            <TouchableOpacity
              className="mt-4 bg-orange-500 px-6 py-3 rounded-lg"
              onPress={() => navigation.navigate('Explore')}
            >
              <Text className="text-white font-medium">
                Explore Destinations
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default WishlistScreen
