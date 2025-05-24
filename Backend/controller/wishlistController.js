import Wishlist from '../model/wishlistModel.js'
import Trek from '../model/trekModel.js'

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.body.userId

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'treks',
      select: 'title location duration price rating images difficulty',
      populate: {
        path: 'companyId',
        select: 'name',
      },
    })

    if (!wishlist) {
      wishlist = new Wishlist({ userId, treks: [] })
      await wishlist.save()
    }

    return res.status(200).json({
      success: true,
      wishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Add trek to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { trekId } = req.body

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Check if trek exists
    const trek = await Trek.findById(trekId)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      wishlist = new Wishlist({ userId, treks: [trekId] })
    } else {
      // Check if trek is already in wishlist
      if (wishlist.treks.includes(trekId)) {
        return res.status(400).json({
          success: false,
          message: 'Trek already in wishlist',
        })
      }

      // Add trek to wishlist
      wishlist.treks.push(trekId)
    }

    await wishlist.save()

    return res.status(200).json({
      success: true,
      message: 'Trek added to wishlist',
      wishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Remove trek from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { trekId } = req.params

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Find wishlist
    const wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      })
    }

    // Check if trek is in wishlist
    if (!wishlist.treks.includes(trekId)) {
      return res.status(400).json({
        success: false,
        message: 'Trek not in wishlist',
      })
    }

    // Remove trek from wishlist
    wishlist.treks = wishlist.treks.filter((id) => id.toString() !== trekId)
    await wishlist.save()

    return res.status(200).json({
      success: true,
      message: 'Trek removed from wishlist',
      wishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Check if trek is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const { trekId } = req.params

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Find wishlist
    const wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        isInWishlist: false,
      })
    }

    // Check if trek is in wishlist
    const isInWishlist = wishlist.treks.includes(trekId)

    return res.status(200).json({
      success: true,
      isInWishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
