import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'

export default function VerifyOtpScreen({ route, navigation }) {
  const { userId, email } = route.params
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Please enter OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        'http://10.0.2.2:5000/api/auth/verify-account',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, otp: otp.trim() }), // Trimming added
        }
      )

      const data = await response.json()
      console.log('Verification response:', data)

      if (response.ok && data.success) {
        Alert.alert('Success', 'Your account has been verified!')

        if (data.role === 'company') {
          navigation.navigate('CompanyDashboard')
        } else if (data.role === 'admin') {
          navigation.navigate('AdminDashboard')
        } else {
          navigation.navigate('Login')
        }
      } else if (data.message?.includes('already verified')) {
        Alert.alert('Already Verified', 'Please login to access your account.')
        navigation.navigate('Login')
      } else {
        Alert.alert('Verification Failed', data.message || 'Try again later.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    width: '100%',
    padding: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: { backgroundColor: '#f97316', padding: 16, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
})
