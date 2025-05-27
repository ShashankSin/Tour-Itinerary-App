// Cosine Similarity Recommendation Engine for Trek Application
import Trek from '../model/trekModel.js'
import Review from '../model/reviewModel.js'
import Wishlist from '../model/wishlistModel.js'
import Booking from '../model/bookingModel.js'

class TrekRecommendationEngine {
  constructor() {
    this.difficultyWeights = { easy: 1, moderate: 2, difficult: 3, extreme: 4 }
    this.categoryWeights = {
      hiking: 1,
      trekking: 2,
      'mountain climbing': 3,
      camping: 1,
      'international travel': 2,
      'adventure travel': 2,
      'wildlife safari': 2,
    }
  }

  // Create feature vector for a trek
  createTrekVector(trek) {
    return [
      this.difficultyWeights[trek.difficulty] || 0,
      this.categoryWeights[trek.category] || 0,
      Math.log(trek.duration + 1), // Log scale for duration
      Math.log(trek.price + 1), // Log scale for price
      trek.rating,
      Math.log(trek.ratingCount + 1), // Log scale for rating count
    ]
  }

  // Create user preference vector based on their interactions
  async createUserVector(userId) {
    try {
      const [userReviews, userWishlist, userBookings] = await Promise.all([
        Review.find({ userId }).populate('trekId'),
        Wishlist.findOne({ userId }).populate('treks'),
        Booking.find({ userId }).populate('trekId'),
      ])

      if (
        userReviews.length === 0 &&
        (!userWishlist || userWishlist.treks.length === 0) &&
        userBookings.length === 0
      ) {
        return await this.getAverageVector()
      }

      const weightedVector = [0, 0, 0, 0, 0, 0]
      let totalWeight = 0

      // Weight based on reviews (highest weight)
      userReviews.forEach((review) => {
        if (review.trekId) {
          const trekVector = this.createTrekVector(review.trekId)
          const weight = review.rating // Use rating as weight
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        }
      })

      // Weight based on bookings (medium weight)
      userBookings.forEach((booking) => {
        if (booking.trekId) {
          const trekVector = this.createTrekVector(booking.trekId)
          const weight = booking.status === 'completed' ? 4 : 3
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        }
      })

      // Weight based on wishlist (lower weight)
      if (userWishlist && userWishlist.treks) {
        userWishlist.treks.forEach((trek) => {
          const trekVector = this.createTrekVector(trek)
          const weight = 2
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        })
      }

      // Normalize the vector
      if (totalWeight > 0) {
        for (let i = 0; i < weightedVector.length; i++) {
          weightedVector[i] /= totalWeight
        }
      }

      return weightedVector
    } catch (error) {
      console.error('Error creating user vector:', error)
      return await this.getAverageVector()
    }
  }

  // Get average vector for new users
  async getAverageVector() {
    try {
      const treks = await Trek.find({ isApproved: true })
      if (treks.length === 0) {
        return [2, 2, 2, 7, 4, 3] // Default fallback vector
      }

      const vectors = treks.map((trek) => this.createTrekVector(trek))
      const avgVector = [0, 0, 0, 0, 0, 0]

      vectors.forEach((vector) => {
        for (let i = 0; i < vector.length; i++) {
          avgVector[i] += vector[i]
        }
      })

      for (let i = 0; i < avgVector.length; i++) {
        avgVector[i] /= vectors.length
      }

      return avgVector
    } catch (error) {
      console.error('Error getting average vector:', error)
      return [2, 2, 2, 7, 4, 3] // Default fallback vector
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      magnitudeA += vectorA[i] * vectorA[i]
      magnitudeB += vectorB[i] * vectorB[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
  }

  // Get recommendations for a user
  async getRecommendations(userId, limit = 5) {
    try {
      const userVector = await this.createUserVector(userId)

      // Get treks user has already interacted with
      const [userReviews, userWishlist, userBookings] = await Promise.all([
        Review.find({ userId }).select('trekId'),
        Wishlist.findOne({ userId }).select('treks'),
        Booking.find({ userId }).select('trekId'),
      ])

      const userInteractedTreks = new Set()
      userReviews.forEach((r) => userInteractedTreks.add(r.trekId.toString()))
      userBookings.forEach((b) => userInteractedTreks.add(b.trekId.toString()))
      if (userWishlist && userWishlist.treks) {
        userWishlist.treks.forEach((trekId) =>
          userInteractedTreks.add(trekId.toString())
        )
      }

      // Get all approved treks not interacted with
      const availableTreks = await Trek.find({
        isApproved: true,
        _id: { $nin: Array.from(userInteractedTreks) },
      })

      // Calculate similarity for all available treks
      const recommendations = availableTreks
        .map((trek) => {
          const trekVector = this.createTrekVector(trek)
          const similarity = this.cosineSimilarity(userVector, trekVector)

          return {
            trek,
            similarity,
            score: similarity * trek.rating * Math.log(trek.ratingCount + 1),
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      return recommendations.map((rec) => ({
        ...rec.trek.toObject(),
        similarityScore: rec.similarity,
        recommendationScore: rec.score,
      }))
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }

  // Get trending treks based on recent ratings and bookings
  async getTrendingTreks(limit = 5) {
    try {
      const treks = await Trek.find({ isApproved: true })

      return treks
        .map((trek) => ({
          ...trek.toObject(),
          trendingScore:
            trek.rating *
            Math.log(trek.ratingCount + 1) *
            (trek.ratingCount / 100),
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting trending treks:', error)
      return []
    }
  }

  // Get popular destinations based on ratings and booking frequency
  async getPopularDestinations(limit = 5) {
    try {
      const treks = await Trek.find({ isApproved: true })
      const locationStats = {}

      treks.forEach((trek) => {
        if (!locationStats[trek.location]) {
          locationStats[trek.location] = {
            location: trek.location,
            treks: [],
            totalRatings: 0,
          }
        }

        locationStats[trek.location].treks.push(trek)
        locationStats[trek.location].totalRatings += trek.ratingCount
      })

      // Calculate stats for each location
      Object.values(locationStats).forEach((stat) => {
        const totalRating = stat.treks.reduce(
          (sum, trek) => sum + trek.rating * trek.ratingCount,
          0
        )
        const totalCount = stat.treks.reduce(
          (sum, trek) => sum + trek.ratingCount,
          0
        )
        stat.avgRating = totalCount > 0 ? totalRating / totalCount : 0
        stat.popularityScore = stat.avgRating * Math.log(totalCount + 1)
        stat.bestTrek = stat.treks.sort((a, b) => b.rating - a.rating)[0]
      })

      return Object.values(locationStats)
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map((stat) => ({
          location: stat.location,
          avgRating: Math.round(stat.avgRating * 10) / 10,
          trekCount: stat.treks.length,
          bestTrek: stat.bestTrek,
          image:
            stat.bestTrek.images?.[0] ||
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        }))
    } catch (error) {
      console.error('Error getting popular destinations:', error)
      return []
    }
  }
}

export default TrekRecommendationEngine
