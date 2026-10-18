import mongoose from 'mongoose';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../utils/constants.js';
import { normalizeToUtcMidnight } from '../utils/dateUtils.js';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [60, 'Full name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: DEPARTMENTS,
        message: '{VALUE} is not a valid department'
      },
      index: true
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(EMPLOYEE_STATUSES),
        message: '{VALUE} is not a valid status'
      },
      default: EMPLOYEE_STATUSES.ACTIVE,
      index: true
    },
    skills: {
      type: [String],
      default: []
    },
    leaveStart: {
      type: Date,
      default: null
    },
    leaveEnd: {
      type: Date,
      default: null
    },
    activeTaskCount: {
      type: Number,
      default: 0,
      min: [0, 'Active task count cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.pre('save', function (next) {
  if (this.joiningDate) {
    this.joiningDate = normalizeToUtcMidnight(this.joiningDate);
  }

  if (this.status === EMPLOYEE_STATUSES.ON_LEAVE) {
    if (this.leaveStart) {
      this.leaveStart = normalizeToUtcMidnight(this.leaveStart);
    }
    if (this.leaveEnd) {
      this.leaveEnd = normalizeToUtcMidnight(this.leaveEnd);
    }
  } else {
    this.leaveStart = null;
    this.leaveEnd = null;
  }
  next();
});

export const Employee = mongoose.model('Employee', employeeSchema);
