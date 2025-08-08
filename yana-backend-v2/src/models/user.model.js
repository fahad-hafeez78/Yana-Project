const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); 

const userSchema = mongoose.Schema(
  {   
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  
    }, 
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',  
    },
    role: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Role',  
      required: true,
    },
    hierarchyLevel: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String, 
      unique: true,
      sparse: true, 
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,  
      private: true, // used by the toJSON plugin
    }
  },
  {
    timestamps: true,
  }
); 
 
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


const User = mongoose.model('User', userSchema);
module.exports = User;