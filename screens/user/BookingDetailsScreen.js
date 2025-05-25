'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the booking data from your API
    // This is just mock data for demonstration
    const mockBookings = {
      1: {
        id: '1',
        trekId: 'trek123',
        companyId: 'company456',
        name: 'Annapurna Base Camp Trek',
        startDate: new Date('2023-10-15'),
        endDate: new Date('2023-10-25'),
        image:
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        participants: 2,
        totalPrice: 32500,
        specialRequests: 'Vegetarian meals required',
        companyName: 'Nepal Trekking Adventures',
        location: 'Annapurna Region, Nepal',
      },
      2: {
        id: '2',
        trekId: 'trek789',
        companyId: 'company456',
        name: 'Pokhara Paragliding',
        startDate: new Date('2023-12-05'),
        endDate: new Date('2023-12-07'),
        image:
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'paypal',
        participants: 1,
        totalPrice: 8500,
        specialRequests: '',
        companyName: 'Pokhara Adventure Sports',
        location: 'Pokhara, Nepal',
      },
    }

    // Simulate API call
    setTimeout(() => {
      setBooking(mockBookings[bookingId])
      setLoading(false)
    }, 500)
  }, [bookingId])

  const formatDateRange = (startDate, endDate) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' }
    const start = startDate.toLocaleDateString('en-US', options)
    const end = endDate.toLocaleDateString('en-US', options)
    return `${start} - ${end}`
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

  const getPaymentStatusBadge = (status) => {
    let backgroundColor, textColor

    switch (status) {
      case 'paid':
        backgroundColor = '#dcfce7' // green-100 equivalent
        textColor = '#166534' // green-800 equivalent
        break
      case 'pending':
        backgroundColor = '#fef9c3' // yellow-100 equivalent
        textColor = '#854d0e' // yellow-800 equivalent
        break
      case 'refunded':
        backgroundColor = '#dbeafe' // blue-100 equivalent
        textColor = '#1e40af' // blue-800 equivalent
        break
      default:
        backgroundColor = '#f3f4f6' // gray-100 equivalent
        textColor = '#4b5563' // gray-600 equivalent
    }

    return { backgroundColor, textColor }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    )
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorMessage}>
          The booking you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Ionicons name="arrow-back" size={16} color="#f97316" />
          <Text style={styles.backButtonText}>Back to Bookings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusStyle = getStatusBadge(booking.status)
  const paymentStatusStyle = getPaymentStatusBadge(booking.paymentStatus)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Ionicons name="arrow-back" size={20} color="#f97316" />
          <Text style={styles.backLinkText}>Back to Bookings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Image
            source={{ uri: booking.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.cardContent}>
            <View style={styles.titleSection}>
              <View>
                <Text style={styles.title}>{booking.name}</Text>
                <Text style={styles.location}>{booking.location}</Text>
                <Text style={styles.company}>
                  Provided by {booking.companyName}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ₹{booking.totalPrice.toLocaleString()}
                </Text>
                <Text style={styles.priceLabel}>Total price</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Trip Dates</Text>
                  <Text style={styles.detailText}>
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </Text>
                  <Text style={styles.detailSubtext}>
                    {Math.ceil(
                      (booking.endDate.getTime() -
                        booking.startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Participants</Text>
                  <Text style={styles.detailText}>
                    {booking.participants}{' '}
                    {booking.participants === 1 ? 'person' : 'people'}
                  </Text>
                </View>
              </View>

              {booking.specialRequests ? (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#f97316"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailTitle}>Special Requests</Text>
                    <Text style={styles.detailText}>
                      {booking.specialRequests}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.detailItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Booking Status</Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusStyle.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: statusStyle.textColor },
                      ]}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Payment</Text>
                  <View style={styles.paymentRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: paymentStatusStyle.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: paymentStatusStyle.textColor },
                        ]}
                      >
                        {booking.paymentStatus.charAt(0).toUpperCase() +
                          booking.paymentStatus.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.paymentMethod}>
                      via{' '}
                      {booking.paymentMethod.charAt(0).toUpperCase() +
                        booking.paymentMethod.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Booking ID</Text>
                  <Text style={styles.bookingId}>{booking.id}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionSection}>
              {booking.status === 'confirmed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.modifyButton}
                    onPress={() =>
                      navigation.navigate('ModifyBooking', {
                        bookingId: booking.id,
                      })
                    }
                  >
                    <Text style={styles.modifyButtonText}>Modify Booking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === 'completed' && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() =>
                    navigation.navigate('WriteReview', {
                      trekId: booking.trekId,
                    })
                  }
                >
                  <Text style={styles.reviewButtonText}>Write a Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7ed', // orange-50 equivalent
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed', // orange-50 equivalent
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff7ed', // orange-50 equivalent
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800 equivalent
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280', // gray-500 equivalent
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100 equivalent
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLinkText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#f97316', // orange-500 equivalent
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
  heroImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800 equivalent
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#4b5563', // gray-600 equivalent
  },
  company: {
    fontSize: 14,
    color: '#6b7280', // gray-500 equivalent
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316', // orange-500 equivalent
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280', // gray-500 equivalent
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563', // gray-600 equivalent
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#1f2937', // gray-800 equivalent
  },
  detailSubtext: {
    fontSize: 14,
    color: '#6b7280', // gray-500 equivalent
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280', // gray-500 equivalent
  },
  bookingId: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1f2937', // gray-800 equivalent
  },
  actionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6', // gray-100 equivalent
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modifyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f97316', // orange-500 equivalent
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modifyButtonText: {
    color: '#f97316', // orange-500 equivalent
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ef4444', // red-500 equivalent
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#ef4444', // red-500 equivalent
    fontSize: 16,
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#f97316', // orange-500 equivalent
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#f97316', // orange-500 equivalent
  },
})

export default BookingDetailScreen
