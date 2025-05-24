import express from 'express'
import {
  createBooking,
  getUserBookings,
  getCompanyBookings,
  updateBookingStatus,
  getBookingById,
} from '../controller/bookingController.js'
import userAuth from '../middlewares/userAuth.js'

const bookingRouter = express.Router()

// All routes require authentication
bookingRouter.post('/create', userAuth, createBooking)
bookingRouter.get('/user', userAuth, getUserBookings)
bookingRouter.get('/company', userAuth, getCompanyBookings)
bookingRouter.put('/status/:id', userAuth, updateBookingStatus)
bookingRouter.get('/:id', userAuth, getBookingById)

export default bookingRouter
