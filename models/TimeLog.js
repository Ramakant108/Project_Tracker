const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
timeLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate duration if both start and end times are present
  if (this.startTime && this.endTime && !this.isRunning) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
  }
  
  next();
});

// Virtual for formatted duration
timeLogSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
});

// Ensure virtual fields are serialized
timeLogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TimeLog', timeLogSchema); 