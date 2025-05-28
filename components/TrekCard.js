import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const TrekCard = ({ trek, onPress }) => {
  return (
    <TouchableOpacity
      className="mr-4 bg-white rounded-xl shadow-sm overflow-hidden w-72"
      onPress={onPress}
    >
      <Image
        source={{
          uri: trek.images[0] || 'https://via.placeholder.com/300x200',
        }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1">
          {trek.title}
        </Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#10b981" />
          <Text className="text-gray-600 ml-1">{trek.location}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#10b981" />
            <Text className="text-gray-600 ml-1">{trek.duration} days</Text>
          </View>
          <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-full">
            <Ionicons name="star" size={14} color="#10b981" />
            <Text className="text-emerald-600 ml-1 font-medium">
              {trek.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row justify-between items-center">
          <Text className="text-emerald-600 font-bold text-lg">
            ${trek.price}
          </Text>
          <View className="bg-emerald-500 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {trek.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TrekCard
