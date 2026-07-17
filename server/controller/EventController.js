const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getEvents); // Public route to get all events
router.get('/:id', getEventById); // Public route to get a specific event by ID
router.post('/', protect, admin, createEvent); // Create event route is protected and only accessible by admin users
router.put('/:id', protect, admin, updateEvent); // Update event route is protected and only accessible by admin users
router.delete('/:id', protect, admin, deleteEvent); // Delete event route is protected and only accessible by admin users

module.exports = router;