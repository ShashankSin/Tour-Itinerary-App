import axios from 'axios'

export const getRecommendedTreks = async (userId, token) => {
  try {
    const response = await axios.get('/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId,
        type: 'recommendations',
        limit: 10,
      },
    })
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

export const getTrendingTreks = async (token) => {
  try {
    const response = await axios.get('/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        type: 'trending',
        limit: 10,
      },
    })
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching trending treks:', error)
    return []
  }
}

export const getPopularDestinations = async (token) => {
  try {
    const response = await axios.get('/recommendations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        type: 'popular-destinations',
        limit: 10,
      },
    })
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching popular destinations:', error)
    return []
  }
}

// Add interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // You could trigger a logout here or refresh token
      console.log('Token expired or invalid')
    }
    return Promise.reject(error)
  }
)
