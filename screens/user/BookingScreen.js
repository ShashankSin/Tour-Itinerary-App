import { useState, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { format } from 'date-fns'
import { jwtDecode } from 'jwt-decode'
import { Calendar } from 'react-native-calendars'

const { width } = Dimensions.get('window')

function BookingScreen({ navigation, route }) {
  const [formStep, setFormStep] = useState('details') // 'details', 'review', 'confirmation'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bookingId, setBookingId] = useState(null)
  const [userToken, setUserToken] = useState(null)
  const [userData, setUserData] = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [itineraryLoading, setItineraryLoading] = useState(true)
  const [bookingStatus, setBookingStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  // Get itinerary ID from navigation params
  const { trekId } = route.params || {}

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    participants: '1',
    paymentMethod: 'card',
    specialRequests: '',
  })

  // Fetch itinerary details using the ID
  // useEffect: Fetch itinerary using trekId
  useEffect(() => {
    const fetchItineraryDetails = async () => {
      if (!trekId) {
        setError('Itinerary ID is missing')
        setItineraryLoading(false)
        return
      }

      try {
        setItineraryLoading(true)
        const response = await axios.get(
          `http://10.0.2.2:5000/api/trek/public/itinerary/${trekId}`
        )
        console.log('Fetched itinerary:', response.data)
        setItinerary(response.data)
      } catch (err) {
        console.error('Error fetching itinerary details:', err)
        setError('Failed to load itinerary details')
      } finally {
        setItineraryLoading(false)
      }
    }

    fetchItineraryDetails()
  }, [trekId])

  // Load user data and token when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken')
        const user = await AsyncStorage.getItem('userData')

        if (token) setUserToken(token)
        if (user) {
          const parsedUser = JSON.parse(user)
          setUserData(parsedUser)
          setFormData((prev) => ({
            ...prev,
            fullName: parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
          }))
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleStatusChange = (status) => {
    setBookingStatus(status)
  }

  const handlePaymentStatusChange = (status) => {
    setPaymentStatus(status)
  }

  const handleStartDateSelect = (day) => {
    const selectedDate = new Date(day.dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'You cannot select a date in the past.')
      return
    }

    setSelectedStartDate(day.dateString)
    setShowStartCalendar(false)

    // If end date is before new start date, clear end date
    if (selectedEndDate && new Date(selectedEndDate) < selectedDate) {
      setSelectedEndDate(null)
    }
  }

  const handleEndDateSelect = (day) => {
    if (!selectedStartDate) {
      Alert.alert('Select Start Date', 'Please select a start date first.')
      return
    }

    const startDate = new Date(selectedStartDate)
    const endDate = new Date(day.dateString)

    if (endDate < startDate) {
      Alert.alert('Invalid Date', 'End date cannot be before start date.')
      return
    }

    setSelectedEndDate(day.dateString)
    setShowEndCalendar(false)
  }

  const handleNext = () => {
    if (formStep === 'details') {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.participants ||
        !selectedStartDate ||
        !selectedEndDate
      ) {
        Alert.alert('Error', 'Please fill in all fields including trip dates.')
        return
      }
      if (!isValidEmail(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address.')
        return
      }
      setFormStep('review')
    }
  }

  // handleConfirm: Confirm booking using itinerary details
  // handleConfirm: Confirm booking using itinerary details
  const handleConfirm = async () => {
    console.log('Confirming booking...')

    const storedToken = await AsyncStorage.getItem('token')
    console.log('Fetched token:', storedToken)

    if (!storedToken) {
      Alert.alert(
        'Authentication Required',
        'Please login to complete your booking',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      )
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const decodedToken = jwtDecode(storedToken)
      const userId = decodedToken.id || decodedToken.userId || decodedToken.sub
      console.log('Decoded token:', decodedToken)
      console.log('Extracted user ID:', userId)

      if (!itinerary) throw new Error('Itinerary not loaded yet')

      // Extract companyId from itinerary.userId (ObjectId or string)
      const companyId =
        typeof itinerary.userId === 'string'
          ? itinerary.userId
          : itinerary.userId?._id

      console.log('Company ID from itinerary.userId:', companyId)

      if (!userId) throw new Error('User ID not found in token')
      if (!companyId) throw new Error('Company ID not found in itinerary')
      if (!itinerary._id) throw new Error('Itinerary ID is missing')

      const participantsCount = Number.parseInt(formData.participants)
      if (isNaN(participantsCount) || participantsCount <= 0) {
        throw new Error('Invalid number of participants')
      }

      const bookingData = {
        userId: userId,
        trekId: itinerary._id,
        companyId: companyId,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        participants: participantsCount,
        totalPrice: calculateTotalPrice(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests || '',
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      }

      console.log('Booking Data:', JSON.stringify(bookingData, null, 2))

      const response = await axios.post(
        'http://10.0.2.2:5000/api/booking/create',
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Booking response:', response.data)

      setBookingId(response.data.booking._id)

      navigation.navigate('Payment', {
        bookingId: response.data.booking._id,
        amount: calculateTotalPrice(),
        paymentMethod: formData.paymentMethod,
        userToken: storedToken,
      })
    } catch (err) {
      console.error('Full error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create booking'
      Alert.alert('Booking Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setFormStep('details')
  }

  const getTripDuration = () => {
    if (!selectedStartDate || !selectedEndDate) return 0

    const start = new Date(selectedStartDate)
    const end = new Date(selectedEndDate)

    // Calculate difference in milliseconds, then convert to days
    const diffInMs = end - start
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

    return diffInDays > 0 ? diffInDays : 1 // Minimum duration is 1 day
  }

  const calculateTotalPrice = () => {
    if (!itinerary || !itinerary.price) return 0
    const participants = Number.parseInt(formData.participants)
    return itinerary.price * participants
  }

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Dates not available'

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid Date'
    }

    const formattedStartDate = format(startDate, 'MMM dd')
    const formattedEndDate = format(endDate, 'MMM dd, yyyy')

    return `${formattedStartDate} - ${formattedEndDate}`
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // If itinerary data is not available, show a loading state
  if (itineraryLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>
            Loading itinerary information...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!itinerary || !itinerary._id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#f97316" />
          <Text style={styles.errorText}>Itinerary information not found.</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderDetailsForm = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Book Your Adventure</Text>
          <Text style={styles.headerSubtitle}>
            Complete your booking details to secure your spot
          </Text>
        </View>

        {/* Trek Card */}
        <View style={styles.trekCard}>
          <Image
            source={{
              uri:
                itinerary.images && itinerary.images.length > 0
                  ? itinerary.images[0]
                  : 'https://via.placeholder.com/400',
            }}
            style={styles.trekImage}
            resizeMode="cover"
          />

          <View style={styles.trekCardContent}>
            <Text style={styles.trekTitle}>
              {itinerary.title || 'Trek Name'}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#f97316" />
              <Text style={styles.infoText}>
                {itinerary.location || 'Location not available'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#f97316" />
              <Text style={styles.infoText}>
                {formatDateRange(itinerary.startDate, itinerary.endDate)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#f97316" />
              <Text style={styles.infoText}>{getTripDuration()} days</Text>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price per person</Text>
                <Text style={styles.priceValue}>${itinerary.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Your Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Booking Details Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Booking Details</Text>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Trip Dates</Text>

            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartCalendar(true)}
              >
                <Text
                  style={
                    selectedStartDate ? styles.dateText : styles.placeholderText
                  }
                >
                  {selectedStartDate
                    ? format(new Date(selectedStartDate), 'MMM dd, yyyy')
                    : 'Select start date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </TouchableOpacity>

              <Text style={styles.dateSeparator}>to</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndCalendar(true)}
                disabled={!selectedStartDate}
              >
                <Text
                  style={[
                    selectedEndDate ? styles.dateText : styles.placeholderText,
                    !selectedStartDate && styles.disabledText,
                  ]}
                >
                  {selectedEndDate
                    ? format(new Date(selectedEndDate), 'MMM dd, yyyy')
                    : 'Select end date'}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={!selectedStartDate ? '#D1D5DB' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            {showStartCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  current={
                    selectedStartDate || new Date().toISOString().split('T')[0]
                  }
                  minDate={new Date().toISOString().split('T')[0]}
                  onDayPress={handleStartDateSelect}
                  markedDates={{
                    [selectedStartDate]: {
                      selected: true,
                      selectedColor: '#f97316',
                    },
                  }}
                />
              </View>
            )}

            {showEndCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  current={
                    selectedEndDate ||
                    selectedStartDate ||
                    new Date().toISOString().split('T')[0]
                  }
                  minDate={
                    selectedStartDate || new Date().toISOString().split('T')[0]
                  }
                  onDayPress={handleEndDateSelect}
                  markedDates={{
                    [selectedEndDate]: {
                      selected: true,
                      selectedColor: '#f97316',
                    },
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Participants</Text>
            <View style={styles.participantContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.participantButton,
                    Number(formData.participants) === num &&
                      styles.participantButtonActive,
                  ]}
                  onPress={() =>
                    handleInputChange('participants', num.toString())
                  }
                >
                  <Text
                    style={[
                      styles.participantButtonText,
                      Number(formData.participants) === num &&
                        styles.participantButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentContainer}>
              {['card', 'paypal', 'apple', 'other'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentButton,
                    formData.paymentMethod === method &&
                      styles.paymentButtonActive,
                  ]}
                  onPress={() => handleInputChange('paymentMethod', method)}
                >
                  <Text
                    style={[
                      styles.paymentButtonText,
                      formData.paymentMethod === method &&
                        styles.paymentButtonTextActive,
                    ]}
                  >
                    {method === 'card'
                      ? 'Credit/Debit Card'
                      : method === 'paypal'
                      ? 'PayPal'
                      : method === 'apple'
                      ? 'Apple Pay'
                      : 'Other'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Any dietary requirements, accessibility needs, or other special requests"
              value={formData.specialRequests}
              onChangeText={(text) =>
                handleInputChange('specialRequests', text)
              }
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.priceLabel}>Price per person</Text>
              <Text style={styles.priceValue}>${itinerary.price}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalPrice}>${calculateTotalPrice()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  const renderReviewScreen = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Review Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Please confirm your booking details
          </Text>
        </View>

        {/* Itinerary Summary */}
        <View style={styles.trekCard}>
          <Image
            source={{
              uri:
                itinerary.images && itinerary.images.length > 0
                  ? itinerary.images[0]
                  : 'https://via.placeholder.com/400',
            }}
            style={styles.trekImage}
            resizeMode="cover"
          />
          <View style={styles.trekCardContent}>
            <Text style={styles.trekTitle}>
              {itinerary.title || 'Trek Name'}
            </Text>
            <Text style={styles.trekLocation}>
              {itinerary.location || 'Location not available'}
            </Text>
            <Text style={styles.trekDates}>
              {formatDateRange(selectedStartDate, selectedEndDate)}
            </Text>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardTitle}>Personal Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{formData.fullName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{formData.email}</Text>
          </View>

          <View style={styles.detailRowLast}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{formData.phone}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Participants</Text>
            <Text style={styles.detailValue}>
              {formData.participants}{' '}
              {Number(formData.participants) === 1 ? 'person' : 'people'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trip Dates</Text>
            <Text style={styles.detailValue}>
              {formatDateRange(selectedStartDate, selectedEndDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{getTripDuration()} days</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
              {formData.paymentMethod}
            </Text>
          </View>

          {formData.specialRequests ? (
            <View style={styles.detailRowLast}>
              <Text style={styles.detailLabel}>Special Requests</Text>
              <Text style={styles.detailValue}>{formData.specialRequests}</Text>
            </View>
          ) : null}
        </View>

        {/* Price Summary */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardTitle}>Price Summary</Text>

          <View style={styles.priceDetailRow}>
            <Text style={styles.priceDetailLabel}>Price per person</Text>
            <Text style={styles.priceDetailValue}>${itinerary.price}</Text>
          </View>

          <View style={styles.priceDetailRow}>
            <Text style={styles.priceDetailLabel}>Participants</Text>
            <Text style={styles.priceDetailValue}>{formData.participants}</Text>
          </View>

          <View style={styles.priceDetailRow}>
            <Text style={styles.priceDetailLabel}>Duration</Text>
            <Text style={styles.priceDetailValue}>
              {getTripDuration()} days
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalRowLabel}>Total Price</Text>
            <Text style={styles.totalRowValue}>${calculateTotalPrice()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  const renderConfirmationScreen = () => (
    <View style={styles.confirmationContainer}>
      <View style={styles.confirmationCard}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={60} color="#10b981" />
        </View>

        <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>

        <Text style={styles.confirmationMessage}>
          Your booking for {itinerary.title || 'your trek'} has been confirmed.
          Please complete your payment to secure your spot.
        </Text>

        <View style={styles.bookingIdContainer}>
          <View style={styles.bookingIdRow}>
            <Text style={styles.bookingIdLabel}>Booking ID</Text>
            <Text style={styles.bookingIdValue}>
              {bookingId || 'Processing...'}
            </Text>
          </View>
        </View>

        <View style={styles.bookingStatusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Booking Status</Text>
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusBadgeText}>Pending</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Status</Text>
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusBadgeText}>Pending</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Amount to Pay</Text>
            <Text style={styles.priceValue}>${calculateTotalPrice()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() =>
            navigation.navigate('Payment', {
              bookingId: bookingId,
              amount: calculateTotalPrice(),
              paymentMethod: formData.paymentMethod,
            })
          }
        >
          <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewBookingsButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.viewBookingsButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header for Details and Review steps */}
      {formStep !== 'confirmation' && (
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitleText}>
                {formStep === 'details'
                  ? 'Book Your Adventure'
                  : 'Review Booking'}
              </Text>
              <Text style={styles.headerSubtitleText}>
                {formStep === 'details'
                  ? 'Complete your details to secure your spot'
                  : 'Please confirm your booking details'}
              </Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarActive} />
            <View
              style={[
                styles.progressBar,
                formStep === 'details'
                  ? styles.progressBarInactive
                  : styles.progressBarActive,
              ]}
            />
          </View>
        </View>
      )}

      {formStep === 'details' && renderDetailsForm()}
      {formStep === 'review' && renderReviewScreen()}
      {formStep === 'confirmation' && renderConfirmationScreen()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#374151',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
  },
  progressBarActive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f97316',
  },
  progressBarInactive: {
    backgroundColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  trekCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  trekImage: {
    width: '100%',
    height: 192,
  },
  reviewTrekImage: {
    width: '100%',
    height: 160,
  },
  trekCardContent: {
    padding: 16,
  },
  trekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  trekLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  trekDates: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  priceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateSeparator: {
    marginHorizontal: 8,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#D1D5DB',
  },
  calendarContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  participantButtonActive: {
    backgroundColor: '#f97316',
  },
  participantButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  participantButtonTextActive: {
    color: 'white',
  },
  paymentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  paymentButtonActive: {
    backgroundColor: '#f97316',
  },
  paymentButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusButtonActive: {
    borderWidth: 0,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusConfirmed: {
    backgroundColor: '#D1FAE5',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  statusButtonTextActive: {
    fontWeight: '500',
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f97316',
  },
  continueButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
    marginBottom: 16,
  },
  reviewCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceDetailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRowLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalRowValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmationCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  bookingIdContainer: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  bookingIdValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  bookingStatusContainer: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  confirmedBadge: {
    backgroundColor: '#D1FAE5',
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  paymentButton: {
    backgroundColor: '#f97316',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewBookingsButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewBookingsButtonText: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 16,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
})

export default BookingScreen
