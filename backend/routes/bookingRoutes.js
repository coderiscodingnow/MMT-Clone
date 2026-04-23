const express = require('express');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { flightId, flightData, passengers, travelClass, promoCode } = req.body;

    if ((!flightId && !flightData) || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: 'Invalid payload' });
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

    if (flight.seatsLeft < passengers.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const pnr = `FLYEZ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 1. Base Fare & Travel Class
    let multiplier = 1;
    if (travelClass === 'Business Class') multiplier = 2.5;
    if (travelClass === 'First Class') multiplier = 4.0;
    const baseFarePerPassenger = Math.round(flight.price * multiplier);

    let totalComputedPrice = 0;

    for (const pax of passengers) {
      let paxTotal = baseFarePerPassenger;

      // Meal Price
      if (['Non-Vegetarian', 'Vegan', 'Jain Meal'].includes(pax.food)) {
        paxTotal += 350;
      }

      // Add-ons Price
      const selectedAddons = pax.addons || [];
      if (selectedAddons.includes('Extra Baggage (15kg)')) paxTotal += 800;
      if (selectedAddons.includes('Travel Insurance')) paxTotal += 299;
      if (selectedAddons.includes('Priority Boarding')) paxTotal += 199;

      // Special Category Discount
      let categoryDiscount = 0;
      if (pax.specialFare === 'Student Discount') categoryDiscount = 500;
      if (pax.specialFare === 'Armed Forces / Ex-Servicemen') categoryDiscount = 800;
      if (pax.specialFare === 'Senior Citizen (60+ years)') categoryDiscount = 600;
      if (pax.specialFare === 'Differently Abled (Divyangjan)') categoryDiscount = 700;
      if (pax.specialFare === 'Unaccompanied Minor') categoryDiscount = 400;

      paxTotal -= categoryDiscount;
      totalComputedPrice += Math.max(0, paxTotal);
    }

    // Promo Discount
    let promoDiscount = 0;
    const totalBaseFare = baseFarePerPassenger * passengers.length;
    if (promoCode === 'FLYEASY10') promoDiscount = Math.min(Math.round(totalBaseFare * 0.1), 500);
    if (promoCode === 'WELCOME200') promoDiscount = 200;
    if (promoCode === 'MONSOON50') promoDiscount = 50;

    totalComputedPrice = Math.max(0, totalComputedPrice - promoDiscount);

    const booking = await Booking.create({
      userId: req.user.id,
      flightId: flight._id,
      passengers,
      travelClass: travelClass || 'Economy',
      promoCode: promoCode || '',
      promoDiscount,
      pnr,
      totalPrice: totalComputedPrice
    });

    flight.seatsLeft -= passengers.length;
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
