import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { useRoute } from '@react-navigation/native'

const EditItineraryScreen = ({ route, navigation }) => {
  const { trekId } = route.params

  const [trekForm, setTrekForm] = useState({
    title: '',
    location: '',
    description: '',
    duration: '',
    price: '',
    difficulty: null,
    category: null,
    images: [],
    itinerary: [],
    inclusions: [],
    route: [],
  })

  const [formStep, setFormStep] = useState(1)
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const difficultyOptions = [
    { label: 'Easy', value: 'easy' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Difficult', value: 'difficult' },
    { label: 'Extreme', value: 'extreme' },
  ]

  const categoryOptions = [
    { label: 'Hiking', value: 'hiking' },
    { label: 'Trekking', value: 'trekking' },
    { label: 'Mountain Climbing', value: 'mountain climbing' },
    { label: 'Camping', value: 'camping' },
    { label: 'International Travel', value: 'international travel' },
    { label: 'Adventure Travel', value: 'adventure travel' },
    { label: 'Wildlife Safari', value: 'wildlife safari' },
  ]

  useEffect(() => {
    if (trekId) {
      console.log('Calling fetchTrekById with:', trekId)
      fetchTrekById(trekId)
    } else {
      setLoading(false)
      console.log('No trekId received')
    }
  }, [trekId])

  const fetchTrekById = async (id) => {
    console.log('📥 Calling fetchTrekById with:', id)
    setLoading(true)

    try {
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setLoading(false)
        navigation.goBack()
        return
      }

      const url = `http://10.0.2.2:5000/api/trek/itinerary/${id}` // ✅ fixed route
      console.log('📡 Fetching from:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const responseText = await response.text() // 👈 check actual raw response
      console.log('📦 Raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText) // 👈 parse manually after logging
      } catch (jsonError) {
        console.error('❌ JSON Parse error:', jsonError)
        Alert.alert('Error', 'Invalid JSON response from server')
        navigation.goBack()
        return
      }

      console.log('✅ Parsed JSON:', data)

      if (response.ok && data.success && data.trek) {
        const trekData = data.trek

        const formattedData = {
          title: trekData.title || '',
          location: trekData.location || '',
          description: trekData.description || '',
          duration: trekData.duration?.toString() || '',
          price: trekData.price?.toString() || '',
          difficulty: trekData.difficulty || '',
          category: trekData.category || '',
          images: trekData.images || [],
          itinerary: trekData.itinerary || [],
          inclusions: trekData.inclusions || [],
          route: trekData.route || [],
        }

        console.log('✅ Final formatted data:', formattedData)
        setTrekForm(formattedData)
      } else {
        Alert.alert('Error', data.message || 'Failed to load trek')
        navigation.goBack()
      }
    } catch (error) {
      console.error('❌ Error fetching trek:', error)
      Alert.alert('Error', 'Failed to fetch trek details')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic Information validation
    if (formStep === 1) {
      if (!trekForm.title) newErrors.title = 'Title is required'
      if (!trekForm.location) newErrors.location = 'Location is required'
      if (!trekForm.description)
        newErrors.description = 'Description is required'
      if (!trekForm.duration) newErrors.duration = 'Duration is required'
      if (!trekForm.price) newErrors.price = 'Price is required'
      if (!trekForm.difficulty) newErrors.difficulty = 'Difficulty is required'
      if (!trekForm.category) newErrors.category = 'Category is required'
    }

    // Images & Itinerary validation
    if (formStep === 2) {
      if (trekForm.images.length === 0)
        newErrors.images = 'At least one image is required'
      if (trekForm.itinerary.length === 0)
        newErrors.itinerary = 'At least one itinerary day is required'

      // Validate each itinerary day
      trekForm.itinerary.forEach((day, index) => {
        if (!day.title)
          newErrors[`itinerary_${index}_title`] = 'Day title is required'
        if (!day.description)
          newErrors[`itinerary_${index}_description`] =
            'Day description is required'
      })
    }

    // Inclusions & Route validation
    if (formStep === 3) {
      if (trekForm.inclusions.length === 0)
        newErrors.inclusions = 'At least one inclusion is required'

      // Validate each inclusion
      trekForm.inclusions.forEach((inclusion, index) => {
        if (!inclusion.trim())
          newErrors[`inclusion_${index}`] = 'Inclusion cannot be empty'
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateTrek = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting')
      return
    }

    setSaving(true)
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        setSaving(false)
        return
      }

      // Normalize the data before sending
      const normalizedData = {
        title: trekForm.title,
        location: trekForm.location,
        description: trekForm.description,
        duration: Number(trekForm.duration),
        price: Number(trekForm.price),
        difficulty: trekForm.difficulty?.toLowerCase(),
        category: trekForm.category?.toLowerCase(),
        images: trekForm.images,
        itinerary: trekForm.itinerary,
        inclusions: trekForm.inclusions,
        route: trekForm.route,
      }

      const response = await fetch(
        `http://10.0.2.2:5000/api/trek/update/${trekId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(normalizedData),
        }
      )

      const data = await response.json()
      console.log('🔄 Update response:', data)

      if (response.ok && data.success) {
        Alert.alert('Success', 'Trek updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ])
      } else {
        Alert.alert('Error', data.message || 'Failed to update trek')
      }
    } catch (error) {
      console.error('❌ Error updating trek:', error)
      Alert.alert('Error', 'Failed to update trek')
    } finally {
      setSaving(false)
    }
  }

  const updateItineraryDay = (index, field, value) => {
    const updated = [...trekForm.itinerary]
    updated[index][field] = value
    setTrekForm({ ...trekForm, itinerary: updated })

    // Clear error for this field if it exists
    if (errors[`itinerary_${index}_${field}`]) {
      const newErrors = { ...errors }
      delete newErrors[`itinerary_${index}_${field}`]
      setErrors(newErrors)
    }
  }

  const addItineraryDay = () => {
    setTrekForm({
      ...trekForm,
      itinerary: [
        ...trekForm.itinerary,
        { day: trekForm.itinerary.length + 1, title: '', description: '' },
      ],
    })
  }

  const removeItineraryDay = (index) => {
    if (trekForm.itinerary.length <= 1) {
      Alert.alert('Error', 'You must have at least one itinerary day')
      return
    }

    const updated = [...trekForm.itinerary]
    updated.splice(index, 1)

    // Renumber days
    updated.forEach((day, i) => {
      day.day = i + 1
    })

    setTrekForm({ ...trekForm, itinerary: updated })
  }

  const addInclusion = () => {
    setTrekForm({ ...trekForm, inclusions: [...trekForm.inclusions, ''] })
  }

  const updateInclusion = (index, text) => {
    const updated = [...trekForm.inclusions]
    updated[index] = text
    setTrekForm({ ...trekForm, inclusions: updated })

    // Clear error for this field if it exists
    if (errors[`inclusion_${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`inclusion_${index}`]
      setErrors(newErrors)
    }
  }

  const removeInclusion = (index) => {
    if (trekForm.inclusions.length <= 1) {
      Alert.alert('Error', 'You must have at least one inclusion')
      return
    }

    const updated = [...trekForm.inclusions]
    updated.splice(index, 1)
    setTrekForm({ ...trekForm, inclusions: updated })
  }

  const addRoutePoint = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setTrekForm({
      ...trekForm,
      route: [...trekForm.route, { latitude, longitude }],
    })
  }

  const clearRoute = () => {
    Alert.alert(
      'Clear Route',
      'Are you sure you want to clear the entire route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setTrekForm({ ...trekForm, route: [] }),
        },
      ]
    )
  }

  const removeRoutePoint = (index) => {
    const updated = [...trekForm.route]
    updated.splice(index, 1)
    setTrekForm({ ...trekForm, route: updated })
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      })

      if (!result.canceled) {
        setTrekForm({
          ...trekForm,
          images: [...trekForm.images, result.assets[0].uri],
        })

        // Clear image error if it exists
        if (errors.images) {
          const newErrors = { ...errors }
          delete newErrors.images
          setErrors(newErrors)
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const removeImage = (index) => {
    if (trekForm.images.length <= 1) {
      Alert.alert('Error', 'You must have at least one image')
      return
    }

    const updated = [...trekForm.images]
    updated.splice(index, 1)
    setTrekForm({ ...trekForm, images: updated })
  }

  const previewImageModal = (imageUri) => {
    setPreviewImage(imageUri)
    setImagePreviewVisible(true)
  }

  const handleNextStep = () => {
    if (validateForm()) {
      setFormStep(formStep + 1)
    } else {
      Alert.alert('Validation Error', 'Please fix the errors before proceeding')
    }
  }

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Basic Information</Text>

            <Text style={styles.inputLabel}>
              Title <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Trek title"
              value={trekForm.title}
              onChangeText={(text) => {
                setTrekForm({ ...trekForm, title: text })
                if (errors.title) {
                  const newErrors = { ...errors }
                  delete newErrors.title
                  setErrors(newErrors)
                }
              }}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}

            <Text style={styles.inputLabel}>
              Location <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="Trek location"
              value={trekForm.location}
              onChangeText={(text) => {
                setTrekForm({ ...trekForm, location: text })
                if (errors.location) {
                  const newErrors = { ...errors }
                  delete newErrors.location
                  setErrors(newErrors)
                }
              }}
            />
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}

            <Text style={styles.inputLabel}>
              Description <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="Detailed description of the trek"
              multiline
              numberOfLines={4}
              value={trekForm.description}
              onChangeText={(text) => {
                setTrekForm({ ...trekForm, description: text })
                if (errors.description) {
                  const newErrors = { ...errors }
                  delete newErrors.description
                  setErrors(newErrors)
                }
              }}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  Duration (days) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.duration && styles.inputError]}
                  placeholder="Duration"
                  keyboardType="numeric"
                  value={trekForm.duration}
                  onChangeText={(text) => {
                    setTrekForm({ ...trekForm, duration: text })
                    if (errors.duration) {
                      const newErrors = { ...errors }
                      delete newErrors.duration
                      setErrors(newErrors)
                    }
                  }}
                />
                {errors.duration && (
                  <Text style={styles.errorText}>{errors.duration}</Text>
                )}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  Price ($) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={trekForm.price}
                  onChangeText={(text) => {
                    setTrekForm({ ...trekForm, price: text })
                    if (errors.price) {
                      const newErrors = { ...errors }
                      delete newErrors.price
                      setErrors(newErrors)
                    }
                  }}
                />
                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>
            </View>

            <View style={{ zIndex: 3000, marginBottom: 16 }}>
              <Text style={styles.inputLabel}>
                Difficulty <Text style={styles.requiredStar}>*</Text>
              </Text>
              <DropDownPicker
                open={difficultyOpen}
                value={trekForm.difficulty}
                items={difficultyOptions}
                setOpen={setDifficultyOpen}
                setValue={(callback) => {
                  setTrekForm((prev) => ({
                    ...prev,
                    difficulty: callback(prev.difficulty),
                  }))
                  if (errors.difficulty) {
                    const newErrors = { ...errors }
                    delete newErrors.difficulty
                    setErrors(newErrors)
                  }
                }}
                style={[
                  styles.dropdown,
                  errors.difficulty && styles.inputError,
                ]}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
                placeholder="Select difficulty"
              />
              {errors.difficulty && (
                <Text style={styles.errorText}>{errors.difficulty}</Text>
              )}
            </View>

            <View style={{ zIndex: 2000, marginBottom: 16 }}>
              <Text style={styles.inputLabel}>
                Category <Text style={styles.requiredStar}>*</Text>
              </Text>
              <DropDownPicker
                open={categoryOpen}
                value={trekForm.category}
                items={categoryOptions}
                setOpen={setCategoryOpen}
                setValue={(callback) => {
                  setTrekForm((prev) => ({
                    ...prev,
                    category: callback(prev.category),
                  }))
                  if (errors.category) {
                    const newErrors = { ...errors }
                    delete newErrors.category
                    setErrors(newErrors)
                  }
                }}
                style={[styles.dropdown, errors.category && styles.inputError]}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={2000}
                zIndexInverse={2000}
                placeholder="Select category"
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>
                Next: Images & Itinerary
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Images & Itinerary</Text>

            <Text style={styles.inputLabel}>
              Trek Images <Text style={styles.requiredStar}>*</Text>
            </Text>
            {errors.images && (
              <Text style={styles.errorText}>{errors.images}</Text>
            )}
            <View style={styles.imagesContainer}>
              {trekForm.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <TouchableOpacity onPress={() => previewImageModal(image)}>
                    <Image
                      source={{ uri: image }}
                      style={styles.uploadedImage}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
              >
                <Ionicons name="add" size={24} color="#666" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              Itinerary <Text style={styles.requiredStar}>*</Text>
            </Text>
            {errors.itinerary && (
              <Text style={styles.errorText}>{errors.itinerary}</Text>
            )}
            {trekForm.itinerary.map((day, index) => (
              <View key={index} style={styles.itineraryDay}>
                <View style={styles.itineraryDayHeader}>
                  <Text style={styles.dayLabel}>Day {day.day}</Text>
                  <TouchableOpacity
                    style={styles.removeDayButton}
                    onPress={() => removeItineraryDay(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>
                  Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`itinerary_${index}_title`] && styles.inputError,
                  ]}
                  placeholder="Day title"
                  value={day.title}
                  onChangeText={(text) =>
                    updateItineraryDay(index, 'title', text)
                  }
                />
                {errors[`itinerary_${index}_title`] && (
                  <Text style={styles.errorText}>
                    {errors[`itinerary_${index}_title`]}
                  </Text>
                )}

                <Text style={styles.inputLabel}>
                  Description <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors[`itinerary_${index}_description`] &&
                      styles.inputError,
                  ]}
                  placeholder="Day description"
                  multiline
                  numberOfLines={3}
                  value={day.description}
                  onChangeText={(text) =>
                    updateItineraryDay(index, 'description', text)
                  }
                />
                {errors[`itinerary_${index}_description`] && (
                  <Text style={styles.errorText}>
                    {errors[`itinerary_${index}_description`]}
                  </Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addDayButton}
              onPress={addItineraryDay}
            >
              <Ionicons name="add-circle" size={18} color="#4CAF50" />
              <Text style={styles.addDayText}>Add Day</Text>
            </TouchableOpacity>

            <View style={styles.formNavigation}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setFormStep(1)}
              >
                <Ionicons name="arrow-back" size={16} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>
                  Next: Inclusions & Route
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Inclusions & Route</Text>

            <Text style={styles.inputLabel}>
              Inclusions <Text style={styles.requiredStar}>*</Text>
            </Text>
            {errors.inclusions && (
              <Text style={styles.errorText}>{errors.inclusions}</Text>
            )}
            {trekForm.inclusions.map((inclusion, index) => (
              <View key={index} style={styles.inclusionItem}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inclusionInput,
                    errors[`inclusion_${index}`] && styles.inputError,
                  ]}
                  placeholder="e.g., Accommodation, Meals, Guide"
                  value={inclusion}
                  onChangeText={(text) => updateInclusion(index, text)}
                />
                <TouchableOpacity
                  style={styles.removeInclusionButton}
                  onPress={() => removeInclusion(index)}
                >
                  <Ionicons name="close-circle" size={22} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            {trekForm.inclusions.map(
              (inclusion, index) =>
                errors[`inclusion_${index}`] && (
                  <Text key={`error_${index}`} style={styles.errorText}>
                    {errors[`inclusion_${index}`]}
                  </Text>
                )
            )}

            <TouchableOpacity
              style={styles.addInclusionButton}
              onPress={addInclusion}
            >
              <Ionicons name="add-circle" size={18} color="#4CAF50" />
              <Text style={styles.addInclusionText}>Add Inclusion</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Trek Route</Text>
            <TouchableOpacity
              style={styles.mapToggleButton}
              onPress={() => setMapVisible(!mapVisible)}
            >
              <Ionicons
                name={mapVisible ? 'map' : 'map-outline'}
                size={18}
                color="#333"
              />
              <Text style={styles.mapToggleText}>
                {mapVisible ? 'Hide Map' : 'Show Map'}
              </Text>
            </TouchableOpacity>

            {mapVisible && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: 27.7172,
                    longitude: 85.324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={addRoutePoint}
                >
                  {trekForm.route.map((point, index) => (
                    <Marker
                      key={index}
                      coordinate={point}
                      title={
                        index === 0
                          ? 'Start'
                          : index === trekForm.route.length - 1
                          ? 'End'
                          : `Point ${index + 1}`
                      }
                      pinColor={
                        index === 0
                          ? 'green'
                          : index === trekForm.route.length - 1
                          ? 'red'
                          : 'blue'
                      }
                    />
                  ))}

                  {trekForm.route.length > 1 && (
                    <Polyline
                      coordinates={trekForm.route}
                      strokeColor="#FF5722"
                      strokeWidth={3}
                    />
                  )}
                </MapView>

                <View style={styles.mapControls}>
                  <TouchableOpacity
                    style={styles.clearRouteButton}
                    onPress={clearRoute}
                  >
                    <Text style={styles.clearRouteText}>Clear Route</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.mapInstructions}>
                  Tap on the map to add route points
                </Text>
              </View>
            )}

            {trekForm.route.length > 0 && (
              <View style={styles.routePointsList}>
                <Text style={styles.routePointsTitle}>
                  Route Points ({trekForm.route.length})
                </Text>
                {trekForm.route.map((point, index) => (
                  <View key={index} style={styles.routePointItem}>
                    <Text style={styles.routePointText}>
                      {index === 0
                        ? 'Start'
                        : index === trekForm.route.length - 1
                        ? 'End'
                        : `Point ${index + 1}`}
                      : {point.latitude.toFixed(4)},{' '}
                      {point.longitude.toFixed(4)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeRoutePointButton}
                      onPress={() => removeRoutePoint(index)}
                    >
                      <Ionicons name="close-circle" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.formNavigation}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setFormStep(2)}
              >
                <Ionicons name="arrow-back" size={16} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateTrek}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Update Trek</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading trek details...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => {
            Alert.alert(
              'Confirm Exit',
              'Are you sure you want to exit? Any unsaved changes will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', onPress: () => navigation.goBack() },
              ]
            )
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Trek</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formStepsContainer}>
        <View style={styles.formSteps}>
          <TouchableOpacity
            style={[styles.formStep, formStep >= 1 && styles.activeFormStep]}
            onPress={() => formStep > 1 && setFormStep(1)}
          >
            <Text
              style={[
                styles.formStepText,
                formStep >= 1 && styles.activeFormStepText,
              ]}
            >
              1
            </Text>
          </TouchableOpacity>
          <View
            style={[
              styles.formStepConnector,
              formStep >= 2 && styles.activeFormStepConnector,
            ]}
          />
          <TouchableOpacity
            style={[styles.formStep, formStep >= 2 && styles.activeFormStep]}
            onPress={() => formStep > 2 && setFormStep(2)}
          >
            <Text
              style={[
                styles.formStepText,
                formStep >= 2 && styles.activeFormStepText,
              ]}
            >
              2
            </Text>
          </TouchableOpacity>
          <View
            style={[
              styles.formStepConnector,
              formStep >= 3 && styles.activeFormStepConnector,
            ]}
          />
          <TouchableOpacity
            style={[styles.formStep, formStep >= 3 && styles.activeFormStep]}
            onPress={() => formStep > 3 && setFormStep(3)}
          >
            <Text
              style={[
                styles.formStepText,
                formStep >= 3 && styles.activeFormStepText,
              ]}
            >
              3
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formStepLabels}>
          <Text
            style={[
              styles.formStepLabel,
              formStep === 1 && styles.activeFormStepLabel,
            ]}
          >
            Basic Info
          </Text>
          <Text
            style={[
              styles.formStepLabel,
              formStep === 2 && styles.activeFormStepLabel,
            ]}
          >
            Images & Itinerary
          </Text>
          <Text
            style={[
              styles.formStepLabel,
              formStep === 3 && styles.activeFormStepLabel,
            ]}
          >
            Inclusions & Route
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFormStep()}
      </ScrollView>

      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setImagePreviewVisible(false)}
            >
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  backButtonHeader: {
    padding: 4,
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
  formStepsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    elevation: 2,
  },
  formSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFormStep: {
    backgroundColor: '#FF5722',
  },
  formStepText: {
    color: '#666',
    fontWeight: 'bold',
  },
  activeFormStepText: {
    color: '#fff',
  },
  formStepConnector: {
    height: 2,
    width: 40,
    backgroundColor: '#e0e0e0',
  },
  activeFormStepConnector: {
    backgroundColor: '#FF5722',
  },
  formStepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  formStepLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    width: '33%',
  },
  activeFormStepLabel: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  requiredStar: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dropdown: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: '#ddd',
  },
  nextButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    margin: 4,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    backgroundColor: '#f9f9f9',
  },
  addImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itineraryDay: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5722',
  },
  itineraryDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  removeDayButton: {
    padding: 4,
  },
  addDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addDayText: {
    marginLeft: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
  formNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  backButtonText: {
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inclusionInput: {
    flex: 1,
    marginBottom: 8,
  },
  removeInclusionButton: {
    marginLeft: 8,
    marginBottom: 8,
  },
  addInclusionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addInclusionText: {
    marginLeft: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapToggleText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  clearRouteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  clearRouteText: {
    color: '#F44336',
    fontWeight: '500',
    fontSize: 12,
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 12,
  },
  routePointsList: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  routePointsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  routePointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  routePointText: {
    fontSize: 12,
    color: '#666',
  },
  removeRoutePointButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    borderRadius: 8,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
  },
})

export default EditItineraryScreen
