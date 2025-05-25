import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

function CompanyBookingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [searchQuery, activeFilter, bookings])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setLoading(false)
        return
      }

      const decoded = jwtDecode(token)

      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockBookings = [
          {
            id: '1',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            customerPhone: '+1234567890',
            trekName: 'Everest Base Camp',
            trekId: 'trek1',
            bookingDate: '2023-05-15',
            trekDate: '2023-06-20',
            participants: 2,
            amount: 1200,
            status: 'confirmed',
            paymentStatus: 'paid',
          },
          {
            id: '2',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            customerPhone: '+0987654321',
            trekName: 'Annapurna Circuit',
            trekId: 'trek2',
            bookingDate: '2023-05-18',
            trekDate: '2023-07-05',
            participants: 1,
            amount: 950,
            status: 'pending',
            paymentStatus: 'partial',
          },
          {
            id: '3',
            customerName: 'Mike Johnson',
            customerEmail: 'mike@example.com',
            customerPhone: '+1122334455',
            trekName: 'Langtang Valley',
            trekId: 'trek3',
            bookingDate: '2023-05-10',
            trekDate: '2023-06-15',
            participants: 4,
            amount: 2400,
            status: 'completed',
            paymentStatus: 'paid',
          },
          {
            id: '4',
            customerName: 'Sarah Williams',
            customerEmail: 'sarah@example.com',
            customerPhone: '+5566778899',
            trekName: 'Everest Base Camp',
            trekId: 'trek1',
            bookingDate: '2023-05-20',
            trekDate: '2023-08-10',
            participants: 2,
            amount: 1200,
            status: 'cancelled',
            paymentStatus: 'refunded',
          },
          {
            id: '5',
            customerName: 'Robert Brown',
            customerEmail: 'robert@example.com',
            customerPhone: '+1231231234',
            trekName: 'Annapurna Base Camp',
            trekId: 'trek4',
            bookingDate: '2023-05-22',
            trekDate: '2023-07-15',
            participants: 3,
            amount: 1800,
            status: 'confirmed',
            paymentStatus: 'paid',
          },
        ]

        setBookings(mockBookings)
        setFilteredBookings(mockBookings)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      Alert.alert('Error', 'Failed to fetch bookings')
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === activeFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(query) ||
          booking.trekName.toLowerCase().includes(query) ||
          booking.customerEmail.toLowerCase().includes(query)
      )
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = (bookingId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this booking as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            setLoading(true)

            // Mock API call - replace with actual API call
            setTimeout(() => {
              const updatedBookings = bookings.map((booking) =>
                booking.id === bookingId
                  ? { ...booking, status: newStatus }
                  : booking
              )

              setBookings(updatedBookings)
              setLoading(false)
              Alert.alert('Success', 'Booking status updated successfully')
            }, 500)
          },
        },
      ]
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2e7d32'
      case 'pending':
        return '#ef6c00'
      case 'completed':
        return '#1976d2'
      case 'cancelled':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#2e7d32'
      case 'partial':
        return '#ef6c00'
      case 'unpaid':
        return '#d32f2f'
      case 'refunded':
        return '#1976d2'
      default:
        return '#666'
    }
  }

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.bookingId}>Booking #{item.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="trail-sign-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.trekName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Trek Date: {new Date(item.trekDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.participants} Participants
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            ${item.amount} -{' '}
            <Text style={{ color: getPaymentStatusColor(item.paymentStatus) }}>
              {item.paymentStatus.charAt(0).toUpperCase() +
                item.paymentStatus.slice(1)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail-outline" size={16} color="#FF5722" />
          <Text style={styles.contactButtonText}>{item.customerEmail}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call-outline" size={16} color="#FF5722" />
          <Text style={styles.contactButtonText}>{item.customerPhone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookingActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => updateBookingStatus(item.id, 'confirmed')}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateBookingStatus(item.id, 'cancelled')}
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateBookingStatus(item.id, 'completed')}
          >
            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Mark Completed</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => Alert.alert('View Details', 'View booking details')}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchBookings}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or trek"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'pending' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'pending' && styles.activeFilterText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'confirmed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('confirmed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'confirmed' && styles.activeFilterText,
              ]}
            >
              Confirmed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'completed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'completed' && styles.activeFilterText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'cancelled' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('cancelled')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'cancelled' && styles.activeFilterText,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No bookings found</Text>
          {searchQuery || activeFilter !== 'all' ? (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: '#FF5722',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  bookingsList: {
    padding: 16,
    paddingTop: 8,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  contactButtonText: {
    marginLeft: 4,
    color: '#FF5722',
    fontSize: 14,
  },
  bookingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  viewButton: {
    backgroundColor: '#607D8B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})

export default CompanyBookingsScreen
