const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  dateTime: {
    type: Date,
    required: [true, 'Please add a date and time']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please add total number of seats'],
    min: [1, 'Total seats must be at least 1']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Please add available seats'],
    min: [0, 'Available seats cannot be negative']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EventSchema.pre('save', function(next) {
  if (this.availableSeats > this.totalSeats) {
    throw new Error('Available seats cannot be greater than total seats');
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
