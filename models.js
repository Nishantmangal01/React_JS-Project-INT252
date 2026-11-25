// models.js - the 5 Mongoose models used by EcoCycle
import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

// ---------- 1. User (citizen, partner or admin) ----------
const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash, never the real password
    role: { type: String, enum: ['citizen', 'partner', 'admin'], required: true },
    partnerType: { type: String, enum: ['center', 'recycler'] }, // only for partners
    organizationName: { type: String, trim: true },
    city: { type: String, trim: true },
    approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'] }, // used for partners
  },
  { timestamps: true }
)

// ---------- 2. Request (a pickup request made by a citizen) ----------
const requestSchema = new Schema(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceType: {
      type: String,
      enum: ['Mobile', 'Laptop', 'Computer', 'Battery', 'Charger', 'Television', 'Other'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Requested', 'Scheduled', 'Picked Up', 'Delivered to Recycler', 'Verified', 'Rejected'],
      default: 'Requested',
    },
    partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedWeightKg: { type: Number, min: 0.01 },
  },
  { timestamps: true }
)

// ---------- 3. Organization (a participating organization, not a login user) ----------
const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// ---------- 4. EprRecord (links an organization to a Verified request) ----------
const eprRecordSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
    weightKg: { type: Number, required: true, min: 0.01 }, // copied from the verified request
    recycledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // a recycler partner
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// ---------- 5. AuditLog (who did what, and when) ----------
const auditLogSchema = new Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['Request', 'EprRecord', 'Partner'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// "models.X || model(...)" avoids the "Cannot overwrite model" error when a file is loaded twice
export const User = models.User || model('User', userSchema)
export const Request = models.Request || model('Request', requestSchema)
export const Organization = models.Organization || model('Organization', organizationSchema)
export const EprRecord = models.EprRecord || model('EprRecord', eprRecordSchema)
export const AuditLog = models.AuditLog || model('AuditLog', auditLogSchema)
