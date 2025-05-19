import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business_name: {
    type: String,
    required: true
  },
  business_type: {
    type: String,
    required: true,
    enum: ['restaurant', 'retail', 'service', 'other']
  },
  business_description: {
    type: String,
    required: true
  },
  business_address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  business_phone: {
    type: String,
    required: true
  },
  business_email: {
    type: String,
    required: true
  },
  business_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  business_documents: {
    tax_id: { type: String, required: true },
    business_license: { type: String, required: true },
    insurance_document: { type: String }
  },
  payment_info: {
    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    routing_number: { type: String, required: true }
  },
  setup_completed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updated_at
sellerProfileSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema); 