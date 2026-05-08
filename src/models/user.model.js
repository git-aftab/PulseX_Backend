import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AvailableUserRole, UserRolesEnum } from "../constants/constant.js";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.USER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    lastLogin: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ======================
// HASH PASSWORD
// ======================

userSchema.pre("save", async function () {
  // Only hash the password if it has been modified
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// ======================
// PASSWORD CHECK
// ======================

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ======================
// ACCESS TOKEN
// ======================

userSchema.methods.generateAccessToken = function () {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';

  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      email: this.email,
    },
    accessSecret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    },
  );
};

// ======================
// REFRESH TOKEN
// ======================

userSchema.methods.generateRefreshToken = function () {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

  return jwt.sign(
    {
      _id: this._id,
    },
    refreshSecret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    },
  );
};

export const User = mongoose.model("User", userSchema);
