const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  attendeeName: {
    type: String,
    required: [true, 'Please add attendee name']
  },
  attendeeEmail: {
    type: String,
    required: [true, 'Please add attendee email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  attendeePhone: {
    type: String,
    required: [true, 'Please add attendee phone number']
  },
  numberOfTickets: {
    type: Number,
    required: [true, 'Please add number of tickets'],
    min: [1, 'Number of tickets must be at least 1']
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

BookingSchema.index(
  { user: 1, event: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'confirmed' }
  }
);

BookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'event',
    select: 'title description dateTime location'
  }).populate({
    path: 'user',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
