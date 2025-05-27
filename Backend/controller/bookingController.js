import Booking from '../model/bookingModel.js'
import Trek from '../model/trekModel.js'
import User from '../model/userModel.js'
import Company from '../model/companyModel.js'
import transporter from '../config/nodemailer.js'

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      trekId,
      startDate,
      endDate,
      participants,
      totalPrice,
      paymentMethod,
      specialRequests,
      userId,
      companyId,
    } = req.body

    // Validate required fields
    if (
      !trekId ||
      !startDate ||
      !endDate ||
      !participants ||
      !totalPrice ||
      !userId ||
      !companyId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    // Check trek existence
    const trek = await Trek.findById(trekId)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    // Check trek approval
    if (!trek.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This trek is not available for booking',
      })
    }

    // Create booking
    const booking = new Booking({
      userId,
      trekId,
      companyId,
      startDate,
      endDate,
      participants,
      totalPrice,
      paymentMethod: paymentMethod || 'card',
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
    })

    await booking.save()

    // Fetch user and company data for emails
    const user = await User.findById(userId)
    const company = await Company.findById(companyId)

    const userName = user?.name || 'Customer'
    const companyName = company?.name || 'the company'
    const userEmail = user?.email || 'no-reply@example.com'
    const companyEmail = company?.email || 'no-reply@example.com'

    // User confirmation email
    const userMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: 'Booking Confirmation - TrekGuide',
      text: `Hi ${userName},

Thank you for booking ${
        trek.title
      } with ${companyName}. Your booking is pending confirmation from the company.

Booking Details:
Start Date: ${new Date(startDate).toLocaleDateString()}
End Date: ${new Date(endDate).toLocaleDateString()}
Participants: ${participants}
Total Price: $${totalPrice}

You will receive another email once your booking is confirmed.

Regards,
TrekGuide Team`,
    }

    // Company notification email
    const companyMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: companyEmail,
      subject: 'New Booking Notification - TrekGuide',
      text: `Hello ${companyName},

You have received a new booking for ${trek.title}.

Booking Details:
Customer: ${userName}
Start Date: ${new Date(startDate).toLocaleDateString()}
End Date: ${new Date(endDate).toLocaleDateString()}
Participants: ${participants}
Total Price: $${totalPrice}

Please log in to your dashboard to confirm or cancel this booking.

Regards,
TrekGuide Team`,
    }

    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(companyMailOptions)

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    })
  } catch (error) {
    console.error('Booking creation error:', error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.body.userId

    const bookings = await Booking.find({ userId })
      .populate('trekId', 'title location duration images')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      bookings,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get company bookings
export const getCompanyBookings = async (req, res) => {
  try {
    const companyId = req.user.id // ✅ Get from token via middleware
    console.log('Company ID:', companyId)
    const bookings = await Booking.find({ companyId })
      .populate('trekId', 'title location duration')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      bookings,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Check if status is valid
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
    }

    // Find booking
    const booking = await Booking.findById(id)
      .populate('trekId', 'title')
      .populate('userId', 'name email')
      .populate('companyId', 'name email')

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      })
    }

    // Check if user is authorized (company or user who made the booking)
    const requesterId = req.body.userId
    if (
      booking.companyId._id.toString() !== requesterId &&
      booking.userId._id.toString() !== requesterId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized: You don't have permission to update this booking",
      })
    }

    // Users can only cancel their own bookings
    if (
      booking.userId._id.toString() === requesterId &&
      status !== 'cancelled'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Users can only cancel their bookings',
      })
    }

    // Update booking status
    booking.status = status
    await booking.save()

    // Send email notification based on status change
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: booking.userId.email,
      subject: `Booking ${
        status.charAt(0).toUpperCase() + status.slice(1)
      } - TrekGuide`,
    }

    if (status === 'confirmed') {
      mailOptions.text = `Hi ${
        booking.userId.name
      },\n\nGreat news! Your booking for ${
        booking.trekId.title
      } has been confirmed by ${
        booking.companyId.name
      }.\n\nBooking Details:\nStart Date: ${new Date(
        booking.startDate
      ).toLocaleDateString()}\nEnd Date: ${new Date(
        booking.endDate
      ).toLocaleDateString()}\nParticipants: ${
        booking.participants
      }\nTotal Price: $${
        booking.totalPrice
      }\n\nWe wish you a wonderful trek!\n\nRegards,\nTrekGuide Team`
    } else if (status === 'cancelled') {
      mailOptions.text = `Hi ${booking.userId.name},\n\nWe're sorry to inform you that your booking for ${booking.trekId.title} has been cancelled.\n\nIf you have any questions, please contact ${booking.companyId.name} directly or our customer support.\n\nRegards,\nTrekGuide Team`
    } else if (status === 'completed') {
      mailOptions.text = `Hi ${booking.userId.name},\n\nYour trek ${booking.trekId.title} with ${booking.companyId.name} has been marked as completed.\n\nWe hope you had a wonderful experience! Please consider leaving a review to help other trekkers.\n\nRegards,\nTrekGuide Team`
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findById(id)
      .populate('trekId')
      .populate('userId', 'name email')
      .populate('companyId', 'name email')

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      })
    }

    // Check if user is authorized (company or user who made the booking)
    const requesterId = req.body.userId
    if (
      booking.companyId._id.toString() !== requesterId &&
      booking.userId._id.toString() !== requesterId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't have permission to view this booking",
      })
    }

    return res.status(200).json({
      success: true,
      booking,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
