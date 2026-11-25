// server.js - Express API for EcoCycle (talks to MongoDB Atlas)
// Sections: 1 imports, 2 app setup, 3 database connection, 4 helper middleware,
// 5 auth, 6 requests, 7 partners, 8 organizations, 9 EPR, 10 audit and stats, 11 listen

// ================= 1. IMPORTS =================
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User, Request, Organization, EprRecord, AuditLog } from './models.js'

// ================= 2. APP SETUP =================
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const REQUEST_STATUSES = ['Requested', 'Scheduled', 'Picked Up', 'Delivered to Recycler', 'Verified', 'Rejected']

// Sends every response in the same shape: { success, message, data }
function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: statusCode < 400, message, data })
}

// Checks that a text is a valid MongoDB ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

// Saves one audit log entry (who did what, and when)
async function writeAudit(action, performedBy, targetType, targetId) {
  await AuditLog.create({ action, performedBy, targetType, targetId })
}

// ================= 3. DATABASE CONNECTION =================
// Connects once and reuses the same connection. This matters on Vercel, where the
// function can be called many times and should not open a new connection every time.
let connectionPromise = null

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Create a .env file (see .env.example).')
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log('MongoDB connected'))
      .catch((error) => {
        connectionPromise = null // allow a retry on the next request
        throw error
      })
  }
  await connectionPromise
}

// Make sure the database is connected before any /api route runs
app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    return sendResponse(res, 500, 'Database connection failed')
  }
})

// ================= 4. HELPER MIDDLEWARE =================
// Reads x-user-id, finds that user in MongoDB and attaches it to req.user.
// The role always comes from the database, never from the browser.
async function requireLogin(req, res, next) {
  const userId = req.headers['x-user-id']
  if (!userId || !isValidId(userId)) {
    return sendResponse(res, 401, 'Please log in first')
  }
  const user = await User.findById(userId)
  if (!user) {
    return sendResponse(res, 401, 'User not found. Please log in again')
  }
  req.user = user
  next()
}

// Allows the request only if the logged-in user has one of the given roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, 'You are not allowed to do this')
    }
    next()
  }
}

// Partners must be approved by the admin before they can work on requests
function isApprovedPartner(user) {
  return user.role === 'partner' && user.approvalStatus === 'Approved'
}

// ================= 5. AUTH ROUTES =================
// Register a citizen or a partner (admin can never register here)
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role, partnerType, organizationName, city } = req.body

  if (!username || !email || !password || !role || !city) {
    return sendResponse(res, 400, 'Username, email, password, role and city are required')
  }
  if (!['citizen', 'partner'].includes(role)) {
    return sendResponse(res, 400, 'Role must be citizen or partner')
  }
  if (password.length < 6) {
    return sendResponse(res, 400, 'Password must be at least 6 characters')
  }
  if (role === 'partner' && !['center', 'recycler'].includes(partnerType)) {
    return sendResponse(res, 400, 'Partner type must be center or recycler')
  }

  const emailLower = email.toLowerCase().trim()
  const existingUser = await User.findOne({ email: emailLower })
  if (existingUser) {
    return sendResponse(res, 409, 'This email is already registered')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = { username, email: emailLower, password: hashedPassword, role, city }
  if (role === 'partner') {
    newUser.partnerType = partnerType
    newUser.organizationName = organizationName
    newUser.approvalStatus = 'Pending'
  }
  const savedUser = await User.create(newUser)

  if (role === 'partner') {
    return sendResponse(res, 201, 'Registered. Please wait for admin approval', { id: savedUser._id })
  }
  return sendResponse(res, 201, 'Registered successfully', { id: savedUser._id })
})

// Login: checks the password and returns id, username and role (never the hash)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return sendResponse(res, 400, 'Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false
  if (!user || !passwordMatches) {
    return sendResponse(res, 401, 'Wrong email or password')
  }

  return sendResponse(res, 200, 'Login successful', {
    id: user._id,
    username: user.username,
    role: user.role,
  })
})

// ================= 6. REQUEST ROUTES =================
// List requests: citizen sees own, partner sees open or assigned, admin sees all
app.get('/api/requests', requireLogin, async (req, res) => {
  let filter = {}

  if (req.user.role === 'citizen') {
    filter = { citizenId: req.user._id }
  } else if (req.user.role === 'partner') {
    if (!isApprovedPartner(req.user)) {
      return sendResponse(res, 403, `Your partner account is ${req.user.approvalStatus}. Only approved partners can see requests`)
    }
    // open requests (not taken yet) or requests assigned to this partner
    filter = { $or: [{ partnerId: { $exists: false } }, { partnerId: null }, { partnerId: req.user._id }] }
  }

  const requests = await Request.find(filter)
    .populate('citizenId', 'username city')
    .populate('partnerId', 'username partnerType')
    .sort({ createdAt: -1 })
  return sendResponse(res, 200, 'Requests loaded', requests)
})

// Create a request (citizen only)
app.post('/api/requests', requireLogin, requireRole('citizen'), async (req, res) => {
  const { deviceType, quantity, address, city, description } = req.body

  if (!deviceType || !quantity || !address || !city) {
    return sendResponse(res, 400, 'Device type, quantity, address and city are required')
  }
  if (!Request.schema.path('deviceType').enumValues.includes(deviceType)) {
    return sendResponse(res, 400, 'Invalid device type')
  }
  if (!(Number(quantity) >= 1)) {
    return sendResponse(res, 400, 'Quantity must be a positive number')
  }

  const newRequest = await Request.create({
    citizenId: req.user._id,
    deviceType,
    quantity: Number(quantity),
    address,
    city,
    description,
  })
  await writeAudit('Request created', req.user._id, 'Request', newRequest._id)
  return sendResponse(res, 201, 'Pickup request created', newRequest)
})

// Get one request with its status history (from the audit log)
app.get('/api/requests/:id', requireLogin, async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, 'Invalid request id')
  }

  const request = await Request.findById(req.params.id)
    .populate('citizenId', 'username city')
    .populate('partnerId', 'username partnerType')
  if (!request) {
    return sendResponse(res, 404, 'Request not found')
  }

  // Access rules per role
  if (req.user.role === 'citizen' && String(request.citizenId._id) !== String(req.user._id)) {
    return sendResponse(res, 403, 'This is not your request')
  }
  if (req.user.role === 'partner') {
    if (!isApprovedPartner(req.user)) {
      return sendResponse(res, 403, 'Only approved partners can view requests')
    }
    const assignedToOther = request.partnerId && String(request.partnerId._id) !== String(req.user._id)
    if (assignedToOther) {
      return sendResponse(res, 403, 'This request is assigned to another partner')
    }
  }

  const history = await AuditLog.find({ targetType: 'Request', targetId: request._id })
    .populate('performedBy', 'username role')
    .sort({ createdAt: 1 })
  return sendResponse(res, 200, 'Request loaded', { request, history })
})

// Update status, partner and verified weight (approved partner or admin only)
app.patch('/api/requests/:id', requireLogin, requireRole('partner', 'admin'), async (req, res) => {
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, 'Invalid request id')
  }
  if (req.user.role === 'partner' && !isApprovedPartner(req.user)) {
    return sendResponse(res, 403, 'Your partner account is not approved yet')
  }

  const request = await Request.findById(req.params.id)
  if (!request) {
    return sendResponse(res, 404, 'Request not found')
  }

  const { status, partnerId, verifiedWeightKg } = req.body

  // A Verified request is final: its weight may already be copied into an EPR record
  if (request.status === 'Verified') {
    return sendResponse(res, 400, 'This request is already Verified and cannot be changed')
  }

  // A partner can only work on open requests or requests assigned to them
  if (req.user.role === 'partner' && request.partnerId && String(request.partnerId) !== String(req.user._id)) {
    return sendResponse(res, 403, 'This request is assigned to another partner')
  }

  // Validate the new values
  if (status !== undefined && !REQUEST_STATUSES.includes(status)) {
    return sendResponse(res, 400, 'Invalid status')
  }
  if (verifiedWeightKg !== undefined && !(Number(verifiedWeightKg) > 0)) {
    return sendResponse(res, 400, 'Verified weight must be a positive number')
  }
  if (partnerId !== undefined) {
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Only an admin can assign a partner')
    }
    if (!isValidId(partnerId)) {
      return sendResponse(res, 400, 'Invalid partner id')
    }
    const partner = await User.findById(partnerId)
    if (!partner || !isApprovedPartner(partner)) {
      return sendResponse(res, 400, 'Partner not found or not approved')
    }
  }

  const finalWeight = verifiedWeightKg !== undefined ? Number(verifiedWeightKg) : request.verifiedWeightKg
  if (status === 'Verified' && !finalWeight) {
    return sendResponse(res, 400, 'Enter the verified weight before marking a request Verified')
  }

  const auditActions = []

  // A partner who works on a request becomes its assigned partner
  if (req.user.role === 'partner' && !request.partnerId) {
    request.partnerId = req.user._id
    auditActions.push('Request taken by partner ' + req.user.username)
  }
  if (partnerId !== undefined && String(request.partnerId) !== String(partnerId)) {
    request.partnerId = partnerId
    auditActions.push('Partner assigned by admin')
  }
  if (status !== undefined && status !== request.status) {
    request.status = status
    auditActions.push('Status changed to ' + status)
  }
  if (verifiedWeightKg !== undefined && Number(verifiedWeightKg) !== request.verifiedWeightKg) {
    request.verifiedWeightKg = Number(verifiedWeightKg)
    auditActions.push('Verified weight set to ' + Number(verifiedWeightKg) + ' kg')
  }

  if (auditActions.length === 0) {
    return sendResponse(res, 200, 'Nothing changed', request)
  }

  await request.save()
  for (const action of auditActions) {
    await writeAudit(action, req.user._id, 'Request', request._id)
  }
  return sendResponse(res, 200, 'Request updated', request)
})

// ================= 7. PARTNER ROUTES (admin) =================
// List all partner users (password hash is never sent)
app.get('/api/partners', requireLogin, requireRole('admin'), async (req, res) => {
  const partners = await User.find({ role: 'partner' }).select('-password').sort({ createdAt: -1 })
  return sendResponse(res, 200, 'Partners loaded', partners)
})

// Approve or reject a partner
app.patch('/api/partners/:id', requireLogin, requireRole('admin'), async (req, res) => {
  const { approvalStatus } = req.body
  if (!isValidId(req.params.id)) {
    return sendResponse(res, 400, 'Invalid partner id')
  }
  if (!['Approved', 'Rejected'].includes(approvalStatus)) {
    return sendResponse(res, 400, 'approvalStatus must be Approved or Rejected')
  }

  const partner = await User.findOne({ _id: req.params.id, role: 'partner' })
  if (!partner) {
    return sendResponse(res, 404, 'Partner not found')
  }

  partner.approvalStatus = approvalStatus
  await partner.save()
  await writeAudit(`Partner ${partner.username} ${approvalStatus.toLowerCase()}`, req.user._id, 'Partner', partner._id)

  const partnerData = partner.toObject()
  delete partnerData.password
  return sendResponse(res, 200, `Partner ${approvalStatus.toLowerCase()}`, partnerData)
})

// ================= 8. ORGANIZATION ROUTES (admin) =================
app.get('/api/organizations', requireLogin, requireRole('admin'), async (req, res) => {
  const organizations = await Organization.find().sort({ createdAt: -1 })
  return sendResponse(res, 200, 'Organizations loaded', organizations)
})

app.post('/api/organizations', requireLogin, requireRole('admin'), async (req, res) => {
  const { name, contactEmail } = req.body
  if (!name || !contactEmail) {
    return sendResponse(res, 400, 'Name and contact email are required')
  }
  if (!contactEmail.includes('@')) {
    return sendResponse(res, 400, 'Enter a valid contact email')
  }

  const organization = await Organization.create({ name, contactEmail, createdBy: req.user._id })
  return sendResponse(res, 201, 'Organization added', organization)
})

// ================= 9. EPR ROUTES (admin) =================
app.get('/api/epr', requireLogin, requireRole('admin'), async (req, res) => {
  const records = await EprRecord.find()
    .populate('organizationId', 'name')
    .populate('requestId', 'deviceType quantity city')
    .populate('recycledBy', 'username organizationName')
    .sort({ createdAt: -1 })
  return sendResponse(res, 200, 'EPR records loaded', records)
})

// Create an EPR record. Allowed only for a Verified request.
app.post('/api/epr', requireLogin, requireRole('admin'), async (req, res) => {
  const { organizationId, requestId, recycledBy, notes } = req.body

  if (!organizationId || !requestId || !recycledBy) {
    return sendResponse(res, 400, 'Organization, request and recycler are required')
  }
  if (!isValidId(organizationId) || !isValidId(requestId) || !isValidId(recycledBy)) {
    return sendResponse(res, 400, 'One of the ids is invalid')
  }

  const organization = await Organization.findById(organizationId)
  if (!organization) {
    return sendResponse(res, 404, 'Organization not found')
  }

  const request = await Request.findById(requestId)
  if (!request) {
    return sendResponse(res, 404, 'Request not found')
  }
  if (request.status !== 'Verified') {
    return sendResponse(res, 400, 'EPR records can only be created for Verified requests')
  }

  const alreadyRecorded = await EprRecord.findOne({ requestId })
  if (alreadyRecorded) {
    return sendResponse(res, 409, 'An EPR record already exists for this request')
  }

  const recycler = await User.findOne({ _id: recycledBy, role: 'partner', partnerType: 'recycler' })
  if (!recycler) {
    return sendResponse(res, 400, 'Recycler must be a partner of type recycler')
  }

  const record = await EprRecord.create({
    organizationId,
    requestId,
    weightKg: request.verifiedWeightKg, // copied from the verified request
    recycledBy,
    notes,
    createdBy: req.user._id,
  })
  await writeAudit(`EPR record created for ${organization.name} (${request.verifiedWeightKg} kg)`, req.user._id, 'EprRecord', record._id)
  return sendResponse(res, 201, 'EPR record created', record)
})

// ================= 10. AUDIT AND STATS ROUTES (admin) =================
app.get('/api/audit', requireLogin, requireRole('admin'), async (req, res) => {
  const logs = await AuditLog.find().populate('performedBy', 'username role').sort({ createdAt: -1 })
  return sendResponse(res, 200, 'Audit log loaded', logs)
})

app.get('/api/stats', requireLogin, requireRole('admin'), async (req, res) => {
  const totalRequests = await Request.countDocuments()
  const partnerCount = await User.countDocuments({ role: 'partner' })
  const eprRecordCount = await EprRecord.countDocuments()

  // requests by status (every status is listed, even when it is 0)
  const requestsByStatus = {}
  for (const status of REQUEST_STATUSES) {
    requestsByStatus[status] = await Request.countDocuments({ status })
  }

  const weightResult = await Request.aggregate([
    { $match: { status: 'Verified' } },
    { $group: { _id: null, total: { $sum: '$verifiedWeightKg' } } },
  ])
  const totalVerifiedWeightKg = weightResult.length > 0 ? weightResult[0].total : 0

  return sendResponse(res, 200, 'Stats loaded', {
    totalRequests,
    requestsByStatus,
    totalVerifiedWeightKg,
    partnerCount,
    eprRecordCount,
  })
})

// ---------- Unknown API routes and unexpected errors ----------
app.use('/api', (req, res) => sendResponse(res, 404, 'API route not found'))

// Hides stack traces from the browser, but prints them in the server terminal
app.use((error, req, res, next) => {
  console.error(error)
  if (error.code === 11000) {
    return sendResponse(res, 409, 'This value already exists')
  }
  if (error.name === 'ValidationError') {
    return sendResponse(res, 400, 'Some fields are invalid')
  }
  return sendResponse(res, 500, 'Something went wrong on the server')
})

// ================= 11. START SERVER =================
// On Vercel this app runs as a serverless function (see api/index.js), so it must not listen.
// Locally (npm run server) we connect first and then listen.
if (!process.env.VERCEL) {
  try {
    await connectDatabase()
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app
