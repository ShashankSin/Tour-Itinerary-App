import express from 'express'
import TrekRecommendationEngine from '../cosine-recommendation-system-algorithm/recommendation-engine.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { userId, type = 'recommendations', limit = 5 } = req.query

    if (type === 'recommendations' && !userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for recommendations',
      })
    }

    const engine = new TrekRecommendationEngine()

    let result
    switch (type) {
      case 'recommendations':
        result = await engine.getRecommendations(userId, parseInt(limit))
        break
      case 'trending':
        result = await engine.getTrendingTreks(parseInt(limit))
        break
      case 'popular-destinations':
        result = await engine.getPopularDestinations(parseInt(limit))
        break
      default:
        return res.status(400).json({ success: false, message: 'Invalid type' })
    }

    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Recommendation error:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})

export default router
