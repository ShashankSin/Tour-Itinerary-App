import Trek from '../model/trekModel.js'
import userModel from '../model/userModel.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
export const createTrek = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

  try {
    const {
      title,
      location,
      description,
      duration,
      price,
      difficulty,
      category,
      images = [],
      itinerary = [],
      inclusions = [],
      route = [],
    } = req.body

    if (
      !title ||
      !location ||
      !description ||
      !duration ||
      !price ||
      !difficulty ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    // Decode JWT token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    // Get user and confirm role is 'company'
    const user = await userModel.findById(userId).select('role')
    if (!user || user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can create treks',
      })
    }

    // Normalize enums
    const normalizedDifficulty = difficulty.toLowerCase()
    const normalizedCategory = category.toLowerCase()

    // Create and save trek
    const trek = new Trek({
      title,
      location,
      description,
      duration,
      price,
      difficulty: normalizedDifficulty,
      category: normalizedCategory,
      images,
      itinerary,
      inclusions,
      route,
      userId,
      isApproved: false,
    })

    await trek.save()

    return res.status(201).json({
      success: true,
      message: 'Trek created successfully',
      trek,
    })
  } catch (error) {
    console.error('Create Trek Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all treks (with optional filters)
export const getAllTreks = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      minPrice,
      maxPrice,
      location,
      sort = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1,
    } = req.query

    const filter = {}

    // Filter treks by company userId
    if (req.companyId) {
      filter.userId = req.companyId
    }

    if (search) {
      filter.$text = { $search: search }
    }

    if (category && category !== 'all') {
      filter.category = category.toLowerCase()
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty.toLowerCase()
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const sortObj = {}
    sortObj[sort] = order === 'asc' ? 1 : -1

    const treks = await Trek.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name logo rating')
      .lean()

    const total = await Trek.countDocuments(filter)

    return res.status(200).json({
      success: true,
      treks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get All Treks Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    })
  }
}

// Get trek by ID
export const getTrek = async (req, res) => {
  try {
    const treks = await Trek.find().populate('userId', 'name email') // Adjust fields as needed

    return res.status(200).json({
      success: true,
      treks,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update trek
export const updateTrek = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID',
      })
    }

    const updatedData = req.body // contains fields like title, location, etc.

    const updatedTrek = await Trek.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })

    if (!updatedTrek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Trek updated successfully',
      trek: updatedTrek,
    })
  } catch (error) {
    console.error('❌ Error updating trek:', error.stack)
    return res.status(500).json({
      success: false,
      message: 'Server error while updating trek',
      error: error.message,
    })
  }
}

// Delete trek
export const deleteTrek = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    console.log('Trek ID to delete:', id) // 🔍 Log the trek ID
    console.log('Requesting user ID:', userId) // 🔍 Log user ID for validation

    const trek = await Trek.findById(id)

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    if (trek.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't own this trek",
      })
    }

    console.log('Deleting Trek:', trek) // 🔍 Optional full log

    await Trek.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: 'Trek deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get company treks
export const getCompanyTreks = async (req, res) => {
  try {
    // Get company ID from authenticated user
    const companyId = req.body.userId

    const treks = await Trek.find({ companyId })

    return res.status(200).json({
      success: true,
      treks,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Admin: Approve trek
export const approveTrek = async (req, res) => {
  try {
    const { id } = req.params
    const { isApproved } = req.body // will be true or false from frontend

    const trek = await Trek.findById(id)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    trek.isApproved = isApproved // <-- set to true or false
    await trek.save()

    return res.status(200).json({
      success: true,
      message: `Trek ${
        isApproved ? 'approved' : 'set to pending'
      } successfully`,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Admin: Reject trek
export const rejectTrek = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const trek = await Trek.findById(id)

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    trek.isApproved = false
    trek.rejectionReason = reason || 'Trek does not meet our standards'
    await trek.save()

    return res.status(200).json({
      success: true,
      message: 'Trek rejected successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getitinerary = async (req, res) => {
  try {
    const { id } = req.params
    console.log('Requested Trek ID:', id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID format',
      })
    }

    const trek = await Trek.findById(id)

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      trek, // Includes itinerary, inclusions, route, etc.
    })
  } catch (error) {
    console.error('Error fetching trek by ID:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    })
  }
}

export const useritineraryfetch = async (req, res) => {
  try {
    const { id } = req.params
    const itinerary = await Trek.findById(id)

    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: 'Itinerary not found' })
    }

    res.status(200).json(itinerary)
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
