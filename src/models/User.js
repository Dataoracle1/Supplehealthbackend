// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     minlength: [2, 'Name must be at least 2 characters'],
//     maxlength: [50, 'Name cannot exceed 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters'],
//     select: false // Don't return password by default
//   },
//   role: {
//     type: String,
//     enum: {
//       values: ['user', 'admin'],
//       message: '{VALUE} is not a valid role'
//     },
//     default: 'user'
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: {
//       type: String,
//       default: 'Nigeria'
//     }
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastLogin: {
//     type: Date
//   },
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
//   phoneVerified: {
//     type: Boolean,
//     default: false
//   },
//   resetPasswordToken: String,
//   resetPasswordExpire: Date,
//   avatar: {
//     url: String,
//     publicId: String
//   }
// }, {
//   timestamps: true // Adds createdAt and updatedAt
// });

// // Index for faster lookups
// userSchema.index({ role: 1, isActive: 1 });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Virtual for full address
// userSchema.virtual('fullAddress').get(function() {
//   if (!this.address || !this.address.street) return null;
  
//   const { street, city, state, zipCode, country } = this.address;
//   return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
// });

// // Ensure virtuals are included in JSON
// userSchema.set('toJSON', { 
//   virtuals: true,
//   transform: function(doc, ret) {
//     delete ret.password; // Extra safety - never return password
//     return ret;
//   }
// });
// userSchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('User', userSchema);    




const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date // ✅ Added this field (used in login controller)
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // ✅ 1 hour (changed from 10 minutes)
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);