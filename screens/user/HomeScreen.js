'use client'

import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import AnimatedView from '../../components/AnimatedView'
import Card from '../../components/Card'
import axios from 'axios'
import { jwt_decode } from 'jwt-decode'

const { width } = Dimensions.get('window')

const fetchItineraries = async () => {
  const res = await axios.get(`http://192.168.1.69:5000/api/trek/allitinerary`)
  const data = res.data.treks
  if (!Array.isArray(data)) throw new Error('Itineraries must be an array')
  return data.filter((itinerary) => itinerary.isApproved === true)
}

const fetchDestinations = async () => []
const fetchUpcomingTrek = async () => null
const fetchWeatherData = async () => ({
  temperature: 24,
  condition: 'Sunny',
  location: 'Kathmandu',
})

const HomeScreen = ({ navigation, authState }) => {
  const { user, token } = authState
  const [userData, setUserData] = useState(user)

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwt_decode(token)
        setUserData(decodedToken.user)
      } catch (e) {
        console.error('Error decoding token:', e)
      }
    }
  }, [token])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState({
    temp: '24°C',
    condition: 'Sunny',
  })
  const [itineraries, setItineraries] = useState([])
  const [destinations, setDestinations] = useState([])
  const [upcomingTrek, setUpcomingTrek] = useState(null)

  const scrollY = useRef(new Animated.Value(0)).current
  const searchBarTranslateY = useRef(new Animated.Value(100)).current
  const searchBarOpacity = useRef(new Animated.Value(0)).current
  const floatingButtonScale = useRef(new Animated.Value(0)).current

  const headerParallaxY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [50, 0, -30],
    extrapolate: 'clamp',
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  })

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [240, 140],
    extrapolate: 'clamp',
  })

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  })

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [treks, dests, upcoming, weather] = await Promise.all([
        fetchItineraries(),
        fetchDestinations(),
        fetchUpcomingTrek(),
        fetchWeatherData(),
      ])
      setItineraries(treks)
      setDestinations(dests)
      setUpcomingTrek(upcoming)
      setWeatherData({
        temp: `${weather.temperature}°C`,
        condition: weather.condition,
      })
    } catch (e) {
      console.error('Error loading data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    Animated.parallel([
      Animated.timing(searchBarTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(floatingButtonScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const renderTrekItem = ({ item, index }) => (
    <Card
      animation="scaleIn"
      delay={150 + index * 100}
      style={{
        width: '100%',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
      onPress={() =>
        navigation.navigate('ItineraryDetail', { itineraryId: item._id })
      }
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri: item.images[0] || '/placeholder.svg?height=200&width=300',
          }}
          style={{
            width: '100%',
            height: 200,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(249, 115, 22, 0.9)',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {item.rating || '4.8'} ★
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
          {item.title}
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
        >
          <Ionicons name="location-outline" size={18} color="#f97316" />
          <Text style={{ marginLeft: 6, color: '#4b5563', fontSize: 15 }}>
            {item.location}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={18} color="#f97316" />
            <Text style={{ marginLeft: 6, color: '#4b5563', fontSize: 15 }}>
              {item.duration || '7 days'}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#f97316',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: 'white', fontWeight: 'bold', marginRight: 4 }}
            >
              Details
            </Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  )

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff8f0',
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 12, color: '#f97316', fontWeight: '500' }}>
          Loading adventures…
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff8f0' }}>
      <StatusBar style="dark" />
      <Animated.View
        style={{
          height: headerHeight,
          opacity: headerOpacity,
          transform: [{ translateY: headerParallaxY }, { scale: headerScale }],
        }}
      >
        <LinearGradient
          colors={['#f97316', '#fb923c', '#fdba74']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 16, paddingBottom: 40 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                Welcome back,
              </Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                {userData?.name || 'Traveler'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons
                  name={
                    weatherData.condition === 'Sunny'
                      ? 'sunny'
                      : 'cloud-outline'
                  }
                  size={16}
                  color="#fff"
                />
                <Text
                  style={{ color: '#fff', marginLeft: 6, fontWeight: '500' }}
                >
                  {weatherData.temp} • {weatherData.condition}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Animated.View
              style={{
                marginBottom: 20,
                transform: [{ translateY: searchBarTranslateY }],
                opacity: searchBarOpacity,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="search" size={20} color="#f97316" />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 16,
                    color: '#4b5563',
                  }}
                  placeholder="Search for trekking adventures"
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </Animated.View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}
              >
                Popular Treks
              </Text>
              <TouchableOpacity>
                <Text style={{ color: '#f97316', fontWeight: '500' }}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={renderTrekItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
        }}
      />

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          backgroundColor: '#f97316',
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={() => navigation.navigate('BudgetPlanner')}
      >
        <View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            Budget Planner
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            Manage your travel expenses
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="wallet" size={22} color="white" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default HomeScreen
