const express = require('express');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { flightId, passengerName, passengerAge } = req.body;

    if (!flightId || !passengerName || !passengerAge) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.seatsLeft <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const pnr = `FLYEZ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const booking = await Booking.create({
      userId: req.user.id,
      flightId,
      passengerName,
      passengerAge,
      pnr,
      totalPrice: flight.price
    });

    flight.seatsLeft -= 1;
    await flight.save();

    await booking.populate('flightId');

    return res.status(201).json({
      message: 'Booking confirmed',
      booking
    });
  } catch (error) {
    next(error);
  }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('flightId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
