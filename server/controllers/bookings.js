const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getMyBookings = asyncHandler(async (req, res, next) => {
  try {
    console.log('=== FETCHING USER BOOKINGS ===');
    console.log('User ID:', req.user.id);
    
    const bookings = await Booking.find({ 
      user: req.user.id,
      status: { $ne: 'cancelled' }
    })
    .populate({
      path: 'event',
      select: 'title description dateTime location availableSeats image',
      options: { lean: true }
    })
    .sort({ bookingDate: -1 })
    .lean();

    console.log(`Found ${bookings.length} active bookings for user ${req.user.id}`);
    
    if (bookings.length > 0) {
      console.log('Sample bookings:', JSON.stringify(bookings.slice(0, 2), null, 2));
    }
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('!!! ERROR IN GET MY BOOKINGS !!!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    next(error);
  }
});

// @desc    Get all bookings including cancelled ones (for admin purposes)
// @route   GET /api/v1/bookings/all
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  try {
    console.log('Fetching all bookings for user:', req.user.id);
    
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title description dateTime location availableSeats image'
      })
      .sort({ bookingDate: -1 });

    console.log(`Found ${bookings.length} total bookings`);
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    throw error;
  }
});

// @desc    Cancel a booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  try {
    console.log('=== CANCEL BOOKING REQUEST ===');
    console.log('Booking ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);
    
    // Find the booking with detailed logging
    const booking = await Booking.findById(req.params.id).populate('event');
    
    if (!booking) {
      console.error('Error: Booking not found');
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }
    
    console.log('Found booking:', {
      id: booking._id,
      user: booking.user,
      status: booking.status,
      event: booking.event?._id
    });

    // Check if user is authorized
    console.log('Comparing user IDs - Booking User:', booking.user, 'Request User:', req.user._id);
    console.log('User role:', req.user.role);
    
    // Get the user ID from the request (it could be in req.user._id or req.user.id)
    const requestUserId = req.user._id || req.user.id;
    
    // Compare the ObjectIds directly
    const isOwner = booking.user.equals(requestUserId);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'admin';
    
    console.log('Authorization check:', { 
      isOwner, 
      isAdmin, 
      bookingUser: booking.user,
      requestUserId,
      bookingUserIdType: typeof booking.user,
      requestUserIdType: typeof requestUserId
    });
    
    if (!isOwner && !isAdmin) {
      console.error('Error: User not authorized to cancel this booking');
      console.error('Booking user ID:', booking.user);
      console.error('Request user ID:', requestUserId);
      console.error('User role:', req.user.role);
      
      return next(
        new ErrorResponse('You are not authorized to cancel this booking', 403)
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      console.log('Warning: Booking already cancelled');
      return next(
        new ErrorResponse('This booking has already been cancelled', 400)
      );
    }

    // Return seats to available count if booking is confirmed
    if (booking.status === 'confirmed' && booking.event) {
      console.log('Returning seats to available count...');
      const event = await Event.findById(booking.event._id);
      
      if (event) {
        console.log('Current available seats:', event.availableSeats);
        console.log('Seats to return:', booking.numberOfTickets);
        
        event.availableSeats = Number(event.availableSeats) + Number(booking.numberOfTickets);
        await event.save();
        
        console.log('Updated available seats:', event.availableSeats);
      } else {
        console.log('Warning: Associated event not found');
      }
    }

    // Update booking status to cancelled
    console.log('Updating booking status to cancelled...');
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    
    const updatedBooking = await booking.save();
    console.log('Booking cancelled successfully:', updatedBooking);
    
    // Send success response
    res.status(200).json({
      success: true,
      data: { 
        message: 'Booking cancelled successfully',
        bookingId: updatedBooking._id,
        eventId: updatedBooking.event?._id,
        seatsReturned: updatedBooking.numberOfTickets
      }
    });
    
  } catch (error) {
    console.error('!!! ERROR IN CANCEL BOOKING !!!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return next(new ErrorResponse('Invalid booking ID format', 400));
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return next(new ErrorResponse(error.message, 400));
    }
    
    next(error);
  }
});

// @desc    Get booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: 'event',
    select: 'title description dateTime location availableSeats'
  });

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this booking`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});
