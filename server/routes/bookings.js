const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyBookings,
  getAllBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookings');

router.use(protect);

router.get('/', getMyBookings);
router.get('/all', protect, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  next();
}, getAllBookings);

router.route('/:id')
  .get(getBooking)
  .delete(cancelBooking);

module.exports = router;
