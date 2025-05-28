const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find().sort({ dateTime: 1 });
  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

exports.createEvent = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private/Admin
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner or admin
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this event`,
        401
      )
    );
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner or admin
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this event`,
        401
      )
    );
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Book an event
// @route   POST /api/v1/events/:id/book
// @access  Private
exports.bookEvent = asyncHandler(async (req, res, next) => {
  console.log('Booking request received:', {
    params: req.params,
    body: req.body,
    user: req.user
  });

  // Validate required fields
  if (!req.body.name || !req.body.email || !req.body.phone) {
    console.error('Missing required fields:', {
      name: !!req.body.name,
      email: !!req.body.email,
      phone: !!req.body.phone
    });
    return next(new ErrorResponse('Please provide name, email, and phone number', 400));
  }

  try {
    // Find the specific event by ID
    const event = await Event.findById(req.params.id);
    console.log('Found event:', event);

    if (!event) {
      console.log('Event not found');
      return next(
        new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
      );
    }

    const { name, email, phone, numberOfTickets = 1 } = req.body;
    console.log('Booking details:', { name, email, phone, numberOfTickets });

    // Validate number of tickets
    const tickets = parseInt(numberOfTickets, 10);
    if (isNaN(tickets) || tickets < 1) {
      console.log('Invalid number of tickets');
      return next(
        new ErrorResponse('Number of tickets must be at least 1', 400)
      );
    }

    // Check if event has enough available seats
    if (event.availableSeats < tickets) {
      console.log('Not enough seats available');
      return next(
        new ErrorResponse(`Only ${event.availableSeats} seats available`, 400)
      );
    }

    // Check if user has already booked this event
    const existingActiveBooking = await Booking.findOne({
      user: req.user.id,
      event: event._id,
      status: { $ne: 'cancelled' }
    });

    if (existingActiveBooking) {
      console.log('User already has an active booking for this event');
      return next(
        new ErrorResponse('You have already booked this event', 400)
      );
    }
    
    // Check if user has a cancelled booking for this event
    const cancelledBooking = await Booking.findOne({
      user: req.user.id,
      event: event._id,
      status: 'cancelled'
    });
    
    if (cancelledBooking) {
      console.log('User has a cancelled booking for this event');
      return next(
        new ErrorResponse('CANCELLED_BOOKING: You have already cancelled your booking for this event. You cannot book it again.', 400)
      );
    }

    console.log('Creating new booking...');
    
    // Create booking
    const booking = new Booking({
      user: req.user.id,
      event: event._id,
      attendeeName: name,
      attendeeEmail: email,
      attendeePhone: phone,
      numberOfTickets: tickets,
      status: 'confirmed',
      bookingDate: new Date()
    });

    // Save the booking
    await booking.save();
    console.log('Booking created:', booking);

    // Update available seats for this specific event
    event.availableSeats -= tickets;
    await event.save();
    console.log('Updated event seats:', event.availableSeats);

    // Populate the event data using modern syntax
    const populatedBooking = await Booking.populate(booking, {
      path: 'event',
      select: 'title description dateTime location availableSeats image'
    });

    console.log('Sending success response');
    
    res.status(200).json({
      success: true,
      data: populatedBooking,
      message: 'Booking successful!'
    });
  } catch (err) {
    console.error('Error in bookEvent:', err);
    next(err);
  }
});
