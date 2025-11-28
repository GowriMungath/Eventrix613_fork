const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['conference', 'workshop', 'seminar', 'concert', 'sports', 'festival', 'other'],
    default: 'other'
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  availableSeats: {
    type: Number,
    default:0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Event+Image'
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: String,
    required: true,
    default: 'system'
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

// Update availableSeats on save
eventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.capacity;
  }
  this.updatedAt = Date.now();
  next();
});

// Add indexes for commonly queried fields
eventSchema.index({ title: 'text', description: 'text' }); // Full-text search index
eventSchema.index({ category: 1 }); // Category search
eventSchema.index({ date: 1 }); // Date sorting
eventSchema.index({ status: 1 }); // Status filtering

module.exports = mongoose.model('Event', eventSchema);
