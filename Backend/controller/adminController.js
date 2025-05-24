import Admin from '../model/Admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body

  try {
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
