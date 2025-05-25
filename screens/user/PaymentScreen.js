'use client'

import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

function PaymentScreen({ navigation, route }) {
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  // Mock data - in a real app this would come from route params
  const bookingDetails = {
    name: 'Annapurna Base Camp Trek',
    date: 'Oct 15 - Oct 25, 2023',
    guests: 2,
    price: 15000,
    tax: 1500,
    total: 16500,
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline' },
    { id: 'wallet', name: 'Digital Wallet', icon: 'wallet-outline' },
  ]

  const formatCardNumber = (text) => {
    // Remove non-digit characters
    const cleaned = text.replace(/\D/g, '')
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white ml-4">Payment</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Booking Summary */}
        <View className="m-4 p-4 bg-white rounded-xl shadow">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Booking Summary
          </Text>
          <Text className="text-gray-800 font-medium">
            {bookingDetails.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">{bookingDetails.date}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="people-outline" size={16} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">
              {bookingDetails.guests} Guests
            </Text>
          </View>

          <View className="border-t border-gray-100 my-3" />

          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Base Price</Text>
            <Text className="text-gray-800">₹{bookingDetails.price}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Taxes & Fees</Text>
            <Text className="text-gray-800">₹{bookingDetails.tax}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="font-bold text-gray-800">Total Amount</Text>
            <Text className="font-bold text-orange-500">
              ₹{bookingDetails.total}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Payment Method
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-4 mb-3 rounded-lg border ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  selectedMethod === method.id ? 'bg-orange-100' : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name={method.icon}
                  size={20}
                  color={selectedMethod === method.id ? '#f97316' : '#6b7280'}
                />
              </View>
              <Text
                className={`ml-3 font-medium ${
                  selectedMethod === method.id
                    ? 'text-orange-500'
                    : 'text-gray-800'
                }`}
              >
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#f97316"
                  className="ml-auto"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Details Form */}
        {selectedMethod === 'card' && (
          <View className="mx-4 mb-6 p-4 bg-white rounded-xl shadow">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Card Details
            </Text>

            <View className="mb-4">
              <Text className="text-gray-600 mb-1">Card Number</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 mb-1">Cardholder Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-600 mb-1">Expiry Date</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  maxLength={5}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-600 mb-1">CVV</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="lock-closed" size={16} color="#9ca3af" />
              <Text className="ml-2 text-gray-500 text-sm">
                Your payment information is secure
              </Text>
            </View>
          </View>
        )}

        {/* UPI Form */}
        {selectedMethod === 'upi' && (
          <View className="mx-4 mb-6 p-4 bg-white rounded-xl shadow">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              UPI Payment
            </Text>

            <View className="mb-4">
              <Text className="text-gray-600 mb-1">UPI ID</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                placeholder="yourname@upi"
              />
            </View>

            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#9ca3af"
              />
              <Text className="ml-2 text-gray-500 text-sm">
                Secure UPI transaction
              </Text>
            </View>
          </View>
        )}

        {/* Digital Wallet Form */}
        {selectedMethod === 'wallet' && (
          <View className="mx-4 mb-6 p-4 bg-white rounded-xl shadow">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Select Wallet
            </Text>

            {['PayTM', 'PhonePe', 'Google Pay'].map((wallet, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center p-3 border-b border-gray-100"
              >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Text className="font-bold text-gray-700">
                    {wallet.charAt(0)}
                  </Text>
                </View>
                <Text className="ml-3 text-gray-800">{wallet}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9ca3af"
                  className="ml-auto"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-orange-500 py-3 rounded-lg items-center"
          onPress={() => navigation.navigate('PaymentConfirmation')}
        >
          <Text className="text-white font-bold text-lg">
            Pay ₹{bookingDetails.total}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default PaymentScreen
