// seedAdmin.js - creates the one admin account. Run once with: npm run seed
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from './models.js'

// You can change these through .env (ADMIN_EMAIL, ADMIN_PASSWORD) before running
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ecocycle.com').toLowerCase()
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'

async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Create a .env file first (see .env.example).')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  const existingAdmin = await User.findOne({ email: adminEmail })
  if (existingAdmin) {
    console.log('Admin already exists:', adminEmail)
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await User.create({
      username: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      city: 'Head Office',
    })
    console.log('Admin created. Email:', adminEmail, '| Password:', adminPassword)
    console.log('Change this password in a real deployment.')
  }

  await mongoose.disconnect()
}

seedAdmin().catch((error) => {
  console.error('Seeding failed:', error.message)
  process.exit(1)
})
