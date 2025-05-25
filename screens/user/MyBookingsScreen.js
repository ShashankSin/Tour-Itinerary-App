import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

function MyBookingsScreen({ navigation }) {
  // Sample data - in a real app, you would fetch this from your API
  const bookings = [
    {
      id: '1',
      trekId: 'trek123',
      companyId: 'company456',
      name: 'Annapurna Base Camp Trek',
      startDate: new Date('2023-10-15'),
      endDate: new Date('2023-10-25'),
      image:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      location: 'Annapurna Region, Nepal',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      participants: 2,
      totalPrice: 32500,
    },
    {
      id: '2',
      trekId: 'trek789',
      companyId: 'company456',
      name: 'Pokhara Paragliding',
      startDate: new Date('2023-12-05'),
      endDate: new Date('2023-12-07'),
      image:
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      location: 'Pokhara, Nepal',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'paypal',
      participants: 1,
      totalPrice: 8500,
    },
  ]

  const formatDateRange = (startDate, endDate) => {
    const options = { month: 'short', day: 'numeric' }
    const start = startDate.toLocaleDateString('en-US', options)
    const end = endDate.toLocaleDateString('en-US', options)
    const year = endDate.getFullYear()
    return `${start} - ${end}, ${year}`
  }

  const getStatusBadge = (status) => {
    let backgroundColor, textColor

    switch (status) {
      case 'confirmed':
        backgroundColor = '#dcfce7' // green-100 equivalent
        textColor = '#166534' // green-800 equivalent
        break
      case 'pending':
        backgroundColor = '#fef9c3' // yellow-100 equivalent
        textColor = '#854d0e' // yellow-800 equivalent
        break
      case 'cancelled':
        backgroundColor = '#fee2e2' // red-100 equivalent
        textColor = '#991b1b' // red-800 equivalent
        break
      case 'completed':
        backgroundColor = '#dbeafe' // blue-100 equivalent
        textColor = '#1e40af' // blue-800 equivalent
        break
      default:
        backgroundColor = '#f3f4f6' // gray-100 equivalent
        textColor = '#4b5563' // gray-600 equivalent
    }

    return { backgroundColor, textColor }
  }

  const renderBookingCard = (booking) => {
    const statusStyle = getStatusBadge(booking.status)

    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.card}
        onPress={() =>
          navigation.navigate('BookingDetail', { bookingId: booking.id })
        }
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: booking.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{booking.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#f97316" />
            <Text style={styles.infoText}>{booking.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#f97316" />
            <Text style={styles.infoText}>
              {formatDateRange(booking.startDate, booking.endDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#f97316" />
            <Text style={styles.infoText}>
              {booking.participants}{' '}
              {booking.participants === 1 ? 'person' : 'people'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>
              ₹{booking.totalPrice.toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          View and manage all your upcoming adventures
        </Text>
      </View>

      <ScrollView style={styles.container}>
        {bookings.length > 0 ? (
          bookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyMessage}>
              You haven't made any bookings yet. Start exploring destinations to
              plan your next adventure!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.exploreButtonText}>Explore Destinations</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7ed', // orange-50 equivalent
  },
  header: {
    backgroundColor: '#f97316', // orange-500 equivalent
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800 equivalent
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563', // gray-600 equivalent
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6', // gray-100 equivalent
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280', // gray-500 equivalent
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316', // orange-500 equivalent
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800 equivalent
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280', // gray-500 equivalent
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#f97316', // orange-500 equivalent
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default MyBookingsScreen
