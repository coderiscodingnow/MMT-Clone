const express = require('express');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { flightId, flightData, passengerName, passengerAge, seat, food, travelClass, specialFare } = req.body;

    if ((!flightId && !flightData) || !passengerName || !passengerAge) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let flight;
    if (flightId) {
      flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
    } else if (flightData) {
      flight = await Flight.create(flightData);
    }

    if (flight.seatsLeft <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const pnr = `FLYEZ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    let multiplier = 1;
    if (travelClass === 'Business Class') multiplier = 2.5;
    if (travelClass === 'First Class') multiplier = 4.0;

    let discount = 1;
    if (specialFare === 'Student') discount = 0.85;
    if (specialFare === 'Armed Forces') discount = 0.80;
    if (specialFare === 'Senior Citizen') discount = 0.90;

    const computedPrice = Math.round(flight.price * multiplier * discount);

    const booking = await Booking.create({
      userId: req.user.id,
      flightId: flight._id,
      passengerName,
      passengerAge,
      seat: seat || 'Unassigned',
      food: food || 'None',
      travelClass: travelClass || 'Economy',
      specialFare: specialFare || 'Regular',
      pnr,
      totalPrice: computedPrice
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
