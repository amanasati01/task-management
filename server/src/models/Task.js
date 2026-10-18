import mongoose from 'mongoose';
import {
  DEPARTMENTS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  PRIORITY_RANK,
  ALLOWED_STATUS_TRANSITIONS
} from '../utils/constants.js';
import { normalizeToUtcMidnight, isTaskOverdue } from '../utils/dateUtils.js';

const employeeSnapshotSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, required: true }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned employee is required'],
      index: true
    },
    employeeSnapshot: {
      type: employeeSnapshotSchema,
      required: true
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
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: Object.values(TASK_PRIORITIES),
        message: '{VALUE} is not a valid priority'
      },
      default: TASK_PRIORITIES.MEDIUM,
      index: true
    },
    priorityRank: {
      type: Number,
      default: 2,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(TASK_STATUSES),
        message: '{VALUE} is not a valid status'
      },
      default: TASK_STATUSES.TODO,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    completedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

taskSchema.pre('save', function (next) {
  if (this.startDate) {
    this.startDate = normalizeToUtcMidnight(this.startDate);
  }
  if (this.dueDate) {
    this.dueDate = normalizeToUtcMidnight(this.dueDate);
  }
  if (this.priority) {
    this.priorityRank = PRIORITY_RANK[this.priority] || 1;
  }
  next();
});

taskSchema.virtual('isOverdue').get(function () {
  return isTaskOverdue(this.dueDate, this.status);
});

taskSchema.virtual('allowedNextStatuses').get(function () {
  return ALLOWED_STATUS_TRANSITIONS[this.status] || [];
});

export const Task = mongoose.model('Task', taskSchema);
