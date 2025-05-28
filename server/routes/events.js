const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  bookEvent
} = require('../controllers/events');

router.route('/')
  .get(getEvents);

router.route('/:id')
  .get(getEvent);

router.use(protect);

router.route('/:id/book')
  .post(bookEvent);

router.use(authorize('admin'));

router.route('/')
  .post(createEvent);

router.route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
