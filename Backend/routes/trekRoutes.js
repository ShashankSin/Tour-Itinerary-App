import express from 'express'
import {
  createTrek,
  getAllTreks,
  getTrek,
  updateTrek,
  deleteTrek,
  getCompanyTreks,
  approveTrek,
  rejectTrek,
  getitinerary,
  useritineraryfetch,
  searchTreks,
} from '../controller/trekController.js'
import adminAuth from '../middlewares/adminAuth.js'
import companyAuth from '../middlewares/companyAuth.js'

const trekRouter = express.Router()

// Public routes
trekRouter.get('/search', searchTreks)
trekRouter.get('/all', companyAuth, getAllTreks)
trekRouter.get('/allitinerary', getTrek)
trekRouter.get('/itinerary/:id', companyAuth, getitinerary)

// Company routes (requires authentication)
trekRouter.post('/create', companyAuth, createTrek)
trekRouter.put('/update/:id', companyAuth, updateTrek)
trekRouter.delete('/delete/:id', companyAuth, deleteTrek)
trekRouter.get('/company/all', companyAuth, getCompanyTreks)

// Admin routes (requires admin authentication)
trekRouter.put('/approve/:id', adminAuth, approveTrek)

trekRouter.put('/reject/:id', companyAuth, adminAuth, rejectTrek)

trekRouter.get('/public/itinerary/:id', useritineraryfetch)
export default trekRouter
