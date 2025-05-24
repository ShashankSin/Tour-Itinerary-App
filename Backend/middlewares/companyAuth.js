import jwt from 'jsonwebtoken'
import userModel from '../model/userModel.js'

const companyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token payload' })
    }

    const user = await userModel.findById(userId).select('role')

    if (!user || user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not a company user',
      })
    }

    req.companyId = userId
    next()
  } catch (error) {
    console.error('Auth error:', error.message)
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' })
  }
}
export default companyAuth
