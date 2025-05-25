import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

const AdminItinerariesScreen = () => {
  const [itineraries, setItineraries] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | approved | pending
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const colors = {
    primary: '#FF7A00',
    primaryLight: '#FFF0E6',
    background: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    border: '#EEEEEE',
  }

  // Fetch all treks
  const fetchItineraries = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(
        `http://192.168.1.69:5000/api/trek/allitinerary`
      )
      const data = res.data.treks
      if (!Array.isArray(data)) throw new Error('Itineraries must be an array')
      setItineraries(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load itineraries. Please try again.')
      setItineraries([])
    } finally {
      setLoading(false)
    }
  }

  // Update isApproved field
  const updateApproval = async (itineraryId, approve) => {
    try {
      console.log('Approving itinerary with ID:', itineraryId)

      const token = await AsyncStorage.getItem('token') // get stored JWT token
      console.log('Token:', token)

      if (!token) {
        Alert.alert(
          'Error',
          'Authorization token is missing. Please log in again.'
        )
        return
      }

      // Decode token and log admin info
      const decoded = jwtDecode(token)
      console.log('Decoded Token:', decoded)

      // Optional: Check if the role is 'admin'
      if (decoded.role !== 'admin') {
        Alert.alert('Unauthorized', 'Only admin can approve itineraries')
        return
      }

      const requestData = {
        isApproved: approve,
      }

      console.log('Sending PUT request with data:', requestData)

      // Optimistically update the UI
      setItineraries((prev) =>
        prev.map((item) =>
          item._id === itineraryId ? { ...item, isApproved: approve } : item
        )
      )

      // Send the PUT request with token in header
      const response = await axios.put(
        `http://192.168.1.69:5000/api/trek/approve/${itineraryId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        Alert.alert(
          'Success',
          `Itinerary ${approve ? 'approved' : 'set to pending'} successfully`
        )
      } else {
        throw new Error(
          response.data.message || 'Failed to update approval status'
        )
      }
    } catch (err) {
      console.error('Error updating approval status:', err)

      Alert.alert('Error', 'Failed to update approval status')

      setItineraries((prev) =>
        prev.map((item) =>
          item._id === itineraryId ? { ...item, isApproved: !approve } : item
        )
      )
    }
  }

  // ✅ Correct way to handle async function inside useEffect
  useEffect(() => {
    const fetchData = async () => {
      await fetchItineraries()
    }
    fetchData()
  }, [])

  const filteredItineraries = itineraries.filter((item) => {
    const txt = searchQuery.toLowerCase()
    const matches =
      item.title?.toLowerCase().includes(txt) ||
      item.location?.toLowerCase().includes(txt)
    if (!matches) return false
    if (filter === 'all') return true
    if (filter === 'approved') return item.isApproved === true
    if (filter === 'pending') return item.isApproved === false
    return true
  })

  if (loading && !itineraries.length) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>
          Loading itineraries...
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Header + Search */}
        <View style={styles.header(colors)}>
          <Text style={styles.title(colors)}>Itineraries</Text>
          <View style={styles.searchBar(colors)}>
            <Ionicons name="search" size={20} color={colors.textLight} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, color: colors.text }}
              placeholder="Search by title or location..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', padding: 16, flexWrap: 'wrap' }}>
          {['all', 'approved', 'pending'].map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                marginRight: 8,
                marginBottom: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === type ? colors.primary : '#F5F5F5',
              }}
              onPress={() => setFilter(type)}
            >
              <Text
                style={{
                  color: filter === type ? colors.background : colors.text,
                  textTransform: 'capitalize',
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox(colors)}>
            <Text style={{ color: '#ef4444' }}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton(colors)}
              onPress={fetchItineraries}
            >
              <Text style={{ color: colors.background }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {filteredItineraries.length ? (
            filteredItineraries.map((item, idx) => (
              <View key={item._id || idx} style={styles.card(colors)}>
                <Image
                  source={{ uri: item.images?.[0] || placeholder }}
                  style={{ width: '100%', height: 160 }}
                />
                <View style={{ padding: 16 }}>
                  {/* Title + Badge */}
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle(colors)}>{item.title}</Text>
                    <View
                      style={{
                        backgroundColor: item.isApproved
                          ? '#E6F7EE'
                          : '#FFF8E6',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: item.isApproved ? '#10b981' : '#f59e0b',
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {item.isApproved ? 'Approved' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {/* Details */}
                  <Text style={styles.textLight(colors)}>{item.location}</Text>
                  <Text style={styles.textLight(colors)}>
                    {item.startDate} - {item.endDate}
                  </Text>
                  <Text style={styles.category(colors)}>
                    Category: {item.category}
                  </Text>
                  <Text style={styles.textLight(colors)}>
                    {item.description?.slice(0, 100)}...
                  </Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.textLight(colors)}>
                      {item.duration} days
                    </Text>
                    <Text style={styles.price(colors)}>${item.price}</Text>
                  </View>
                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 16,
                      justifyContent: 'flex-end',
                    }}
                  >
                    {!item.isApproved ? (
                      <TouchableOpacity
                        style={styles.approveBtn(colors)}
                        onPress={() => {
                          console.log('Approving itinerary with ID:', item._id)
                          updateApproval(item._id, true)
                        }}
                      >
                        <Ionicons
                          name="checkmark-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.btnText}>Approve</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.pendingBtn}
                        onPress={() => {
                          console.log(
                            'Setting itinerary to pending with ID:',
                            item._id
                          )
                          updateApproval(item._id, false)
                        }}
                      >
                        <Ionicons
                          name="reload-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.btnText}>Set Pending</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.center}>
              <Ionicons name="map-outline" size={48} color="#DDDDDD" />
              <Text
                style={{
                  marginTop: 16,
                  color: colors.textLight,
                  textAlign: 'center',
                }}
              >
                No itineraries found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// Some styling helpers
const placeholder =
  'https://via.placeholder.com/300x200/FF7A00/FFFFFF?text=Trek'

const styles = {
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: (c) => ({
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.primaryLight,
  }),
  title: (c) => ({ fontSize: 28, fontWeight: 'bold', color: c.primary }),
  searchBar: (c) => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.background,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: c.border,
    marginTop: 16,
  }),
  errorBox: (c) => ({
    padding: 16,
    backgroundColor: '#FEEBEB',
    marginHorizontal: 16,
    borderRadius: 8,
  }),
  retryButton: (c) => ({
    backgroundColor: c.primary,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  }),
  card: (c) => ({
    backgroundColor: c.background,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }),
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: (c) => ({ fontSize: 18, fontWeight: 'bold', color: c.text }),
  textLight: (c) => ({ color: c.textLight, marginBottom: 8 }),
  category: (c) => ({ fontWeight: 'bold', color: c.primary, marginBottom: 8 }),
  price: (c) => ({ fontWeight: 'bold', color: c.primary }),
  approveBtn: (c) => ({
    backgroundColor: c.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  }),
  pendingBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
}

export default AdminItinerariesScreen
